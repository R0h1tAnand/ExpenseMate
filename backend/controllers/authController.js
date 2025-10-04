const bcrypt = require('bcryptjs');
const { Company, User } = require('../models');
const { generateToken, generateRefreshToken } = require('../utils/jwt');
const { sendSuccess, sendCreated, sendError, sendUnauthorized } = require('../utils/response');
const { getAvailableCurrencies } = require('../utils/currency');

/**
 * Company Signup with Admin creation
 */
const signup = async (req, res) => {
  try {
    const { companyName, defaultCurrency, firstName, lastName, email, password } = req.body;

    // Validate currency
    const availableCurrencies = await getAvailableCurrencies();
    if (!availableCurrencies.includes(defaultCurrency)) {
      return sendError(res, 400, 'Invalid currency code');
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return sendError(res, 400, 'Email already registered');
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create company first
    const company = await Company.create({
      name: companyName,
      defaultCurrency
    });

    // Create admin user linked to company
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'ADMIN',
      companyId: company.companyId,
      managerId: null,
      isActive: true
    });

    // Generate tokens
    const tokenPayload = {
      userId: user.userId,
      email: user.email,
      role: user.role,
      companyId: user.companyId
    };

    const accessToken = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return sendCreated(res, 'Company and admin account created successfully', {
      user: {
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      company: {
        companyId: company.companyId,
        name: company.name,
        defaultCurrency: company.defaultCurrency
      },
      tokens: {
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      if (error.fields?.name) {
        return sendError(res, 400, 'Company name already exists');
      }
      if (error.fields?.email) {
        return sendError(res, 400, 'Email already registered');
      }
    }
    
    return sendError(res, 500, 'Failed to create account');
  }
};

/**
 * User Login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with company details
    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['companyId', 'name', 'defaultCurrency']
        }
      ]
    });

    if (!user) {
      return sendUnauthorized(res, 'Invalid email or password');
    }

    if (!user.isActive) {
      return sendUnauthorized(res, 'Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return sendUnauthorized(res, 'Invalid email or password');
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    // Generate tokens
    const tokenPayload = {
      userId: user.userId,
      email: user.email,
      role: user.role,
      companyId: user.companyId
    };

    const accessToken = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return sendSuccess(res, 'Login successful', {
      user: {
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        companyId: user.companyId
      },
      company: user.company,
      tokens: {
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return sendError(res, 500, 'Login failed');
  }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['companyId', 'name', 'defaultCurrency']
        },
        {
          model: User,
          as: 'manager',
          attributes: ['userId', 'firstName', 'lastName', 'email']
        }
      ],
      attributes: { exclude: ['password'] }
    });

    return sendSuccess(res, 'Profile retrieved successfully', user);
  } catch (error) {
    console.error('Get profile error:', error);
    return sendError(res, 500, 'Failed to retrieve profile');
  }
};

/**
 * Update profile
 */
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName } = req.body;

    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    await user.update({
      ...(firstName && { firstName }),
      ...(lastName && { lastName })
    });

    return sendSuccess(res, 'Profile updated successfully', {
      userId: user.userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return sendError(res, 500, 'Failed to update profile');
  }
};

/**
 * Change password
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return sendError(res, 400, 'Current password is incorrect');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    await user.update({ password: hashedNewPassword });

    return sendSuccess(res, 'Password changed successfully');
  } catch (error) {
    console.error('Change password error:', error);
    return sendError(res, 500, 'Failed to change password');
  }
};

/**
 * Refresh token
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return sendUnauthorized(res, 'Refresh token is required');
    }

    const { verifyToken } = require('../utils/jwt');
    const decoded = verifyToken(refreshToken);

    // Find user to make sure they still exist and are active
    const user = await User.findByPk(decoded.userId);
    if (!user || !user.isActive) {
      return sendUnauthorized(res, 'Invalid refresh token');
    }

    // Generate new access token
    const tokenPayload = {
      userId: user.userId,
      email: user.email,
      role: user.role,
      companyId: user.companyId
    };

    const newAccessToken = generateToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    return sendSuccess(res, 'Token refreshed successfully', {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return sendUnauthorized(res, 'Invalid refresh token');
    }
    
    console.error('Refresh token error:', error);
    return sendError(res, 500, 'Failed to refresh token');
  }
};

module.exports = {
  signup,
  login,
  getProfile,
  updateProfile,
  changePassword,
  refreshToken
};