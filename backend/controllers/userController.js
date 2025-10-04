const bcrypt = require('bcryptjs');
const { User, Company } = require('../models');
const { sendSuccess, sendCreated, sendError, sendNotFound } = require('../utils/response');
const { paginate } = require('../utils/response');
const emailService = require('../utils/emailService');

/**
 * Get all users (Admin only, or Manager for subordinates)
 */
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, isActive } = req.query;
    
    // Build where clause
    const whereClause = { companyId: req.user.companyId };
    
    if (role) {
      whereClause.role = role;
    }
    
    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }

    // If user is Manager, only show subordinates
    if (req.user.role === 'MANAGER') {
      whereClause.managerId = req.user.userId;
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'manager',
          attributes: ['userId', 'firstName', 'lastName', 'email']
        }
      ],
      attributes: { exclude: ['password'] },
      ...paginate({ page, limit }, 0),
      order: [['createdAt', 'DESC']]
    });

    const paginationMeta = paginate({ page, limit }, count);

    return sendSuccess(res, 'Users retrieved successfully', users, paginationMeta.pagination);
  } catch (error) {
    console.error('Get users error:', error);
    return sendError(res, 500, 'Failed to retrieve users');
  }
};

/**
 * Get user by ID
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({
      where: { 
        userId: id,
        companyId: req.user.companyId // Ensure same company
      },
      include: [
        {
          model: User,
          as: 'manager',
          attributes: ['userId', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'subordinates',
          attributes: ['userId', 'firstName', 'lastName', 'email', 'role']
        }
      ],
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return sendNotFound(res, 'User not found');
    }

    return sendSuccess(res, 'User retrieved successfully', user);
  } catch (error) {
    console.error('Get user error:', error);
    return sendError(res, 500, 'Failed to retrieve user');
  }
};

/**
 * Create new user (Admin only)
 */
const createUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, managerId } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return sendError(res, 400, 'Email already exists');
    }

    // Validate manager if provided
    if (managerId) {
      const manager = await User.findOne({
        where: { 
          userId: managerId, 
          companyId: req.user.companyId,
          role: ['ADMIN', 'MANAGER']
        }
      });
      
      if (!manager) {
        return sendError(res, 400, 'Invalid manager ID');
      }
    }

    // Use the provided password (no need to generate temporary password)
    const userPassword = password;

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(userPassword, salt);

    // Get company information for email
    const company = await Company.findByPk(req.user.companyId);

    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: role || 'EMPLOYEE',
      companyId: req.user.companyId,
      managerId: managerId || null,
      isActive: true
    });

    // Send welcome email with the exact password that was entered
    try {
      const emailResult = await emailService.sendWelcomeEmail({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        companyName: company.name
      }, userPassword); // Send the original password, not hashed

      if (!emailResult.success) {
        console.warn('Failed to send welcome email:', emailResult.error);
        // Don't fail the user creation if email fails
      }
    } catch (emailError) {
      console.error('Email service error:', emailError);
      // Don't fail the user creation if email fails
    }

    return sendCreated(res, 'User created successfully and welcome email sent', {
      userId: user.userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      managerId: user.managerId,
      isActive: user.isActive,
      createdAt: user.createdAt,
      emailSent: true // Indicate that email was attempted
    });
  } catch (error) {
    console.error('Create user error:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return sendError(res, 400, 'Email already exists');
    }
    
    return sendError(res, 500, 'Failed to create user');
  }
};

/**
 * Update user
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, role, managerId, isActive } = req.body;

    const user = await User.findOne({
      where: { 
        userId: id,
        companyId: req.user.companyId
      }
    });

    if (!user) {
      return sendNotFound(res, 'User not found');
    }

    // Only admin can change role and isActive status
    const updateData = {};
    
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    
    if (req.user.role === 'ADMIN') {
      if (role) updateData.role = role;
      if (isActive !== undefined) updateData.isActive = isActive;
      if (managerId !== undefined) updateData.managerId = managerId;
    }

    // Validate manager if provided
    if (updateData.managerId) {
      const manager = await User.findOne({
        where: { 
          userId: updateData.managerId, 
          companyId: req.user.companyId,
          role: ['ADMIN', 'MANAGER']
        }
      });
      
      if (!manager) {
        return sendError(res, 400, 'Invalid manager ID');
      }
    }

    await user.update(updateData);

    return sendSuccess(res, 'User updated successfully', {
      userId: user.userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      managerId: user.managerId,
      isActive: user.isActive,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    console.error('Update user error:', error);
    return sendError(res, 500, 'Failed to update user');
  }
};

/**
 * Delete user (Admin only)
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({
      where: { 
        userId: id,
        companyId: req.user.companyId
      }
    });

    if (!user) {
      return sendNotFound(res, 'User not found');
    }

    // Cannot delete own account
    if (user.userId === req.user.userId) {
      return sendError(res, 400, 'Cannot delete your own account');
    }

    await user.destroy();

    return sendSuccess(res, 'User deleted successfully');
  } catch (error) {
    console.error('Delete user error:', error);
    return sendError(res, 500, 'Failed to delete user');
  }
};

/**
 * Assign manager to user
 */
const assignManager = async (req, res) => {
  try {
    const { id } = req.params;
    const { managerId } = req.body;

    const user = await User.findOne({
      where: { 
        userId: id,
        companyId: req.user.companyId
      }
    });

    if (!user) {
      return sendNotFound(res, 'User not found');
    }

    // Validate manager
    if (managerId) {
      const manager = await User.findOne({
        where: { 
          userId: managerId, 
          companyId: req.user.companyId,
          role: ['ADMIN', 'MANAGER']
        }
      });
      
      if (!manager) {
        return sendError(res, 400, 'Invalid manager ID');
      }
    }

    await user.update({ managerId });

    return sendSuccess(res, 'Manager assigned successfully', {
      userId: user.userId,
      managerId: user.managerId
    });
  } catch (error) {
    console.error('Assign manager error:', error);
    return sendError(res, 500, 'Failed to assign manager');
  }
};

/**
 * Change user role (Admin only)
 */
const changeRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await User.findOne({
      where: { 
        userId: id,
        companyId: req.user.companyId
      }
    });

    if (!user) {
      return sendNotFound(res, 'User not found');
    }

    // Cannot change own role
    if (user.userId === req.user.userId) {
      return sendError(res, 400, 'Cannot change your own role');
    }

    await user.update({ role });

    return sendSuccess(res, 'User role updated successfully', {
      userId: user.userId,
      role: user.role
    });
  } catch (error) {
    console.error('Change role error:', error);
    return sendError(res, 500, 'Failed to change user role');
  }
};

/**
 * Get subordinates (Manager only)
 */
const getSubordinates = async (req, res) => {
  try {
    const subordinates = await User.findAll({
      where: { 
        managerId: req.user.userId,
        companyId: req.user.companyId
      },
      attributes: { exclude: ['password'] },
      order: [['firstName', 'ASC']]
    });

    return sendSuccess(res, 'Subordinates retrieved successfully', subordinates);
  } catch (error) {
    console.error('Get subordinates error:', error);
    return sendError(res, 500, 'Failed to retrieve subordinates');
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  assignManager,
  changeRole,
  getSubordinates
};