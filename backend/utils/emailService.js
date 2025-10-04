const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_SERVER,
      port: process.env.MAIL_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  async sendWelcomeEmail(userDetails, tempPassword) {
    const { email, firstName, lastName, role, companyName } = userDetails;
    
    const subject = `Welcome to ${companyName} - Your Account Details`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4f46e5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .credentials { background-color: #e5e7eb; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .warning { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 10px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          .btn { display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to ${companyName}</h1>
            <p>Expense Management System</p>
          </div>
          
          <div class="content">
            <h2>Hello ${firstName} ${lastName},</h2>
            
            <p>Your account has been created successfully! You have been assigned the role of <strong>${role}</strong> in the ${companyName} expense management system.</p>
            
            <div class="credentials">
              <h3>Your Login Credentials:</h3>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Password:</strong> ${tempPassword}</p>
              <p><strong>Login URL:</strong> <a href="http://localhost:5173">http://localhost:5173</a></p>
            </div>
            
            <div class="warning">
              <strong>Important Security Notice:</strong>
              <ul>
                <li>This password has been set by your administrator</li>
                <li>Please consider changing your password after logging in for security</li>
                <li>Do not share these credentials with anyone</li>
                <li>Keep your login information secure</li>
              </ul>
            </div>
            
            <p>Your role as <strong>${role}</strong> gives you access to:</p>
            <ul>
              ${role === 'MANAGER' ? `
                <li>Review and approve/reject expense reports from your team</li>
                <li>View team expense summaries and analytics</li>
                <li>Manage your own expense reports</li>
              ` : `
                <li>Create and submit expense reports</li>
                <li>Track the status of your submissions</li>
                <li>Upload receipts and documentation</li>
              `}
            </ul>
            
            <div style="text-align: center;">
              <a href="http://localhost:5173" class="btn">Login to Your Account</a>
            </div>
            
            <p>If you have any questions or need assistance, please contact your system administrator.</p>
            
            <p>Best regards,<br>
            ${companyName} IT Team</p>
          </div>
          
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>${companyName} Expense Management System</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
Welcome to ${companyName} - Expense Management System

Hello ${firstName} ${lastName},

Your account has been created successfully! You have been assigned the role of ${role}.

Your Login Credentials:
Email: ${email}
Password: ${tempPassword}
Login URL: http://localhost:5173

IMPORTANT SECURITY NOTICE:
- This password has been set by your administrator
- Please consider changing your password after logging in for security
- Do not share these credentials with anyone
- Keep your login information secure

Best regards,
${companyName} IT Team

This is an automated message. Please do not reply to this email.
    `;

    const mailOptions = {
      from: `"${companyName} IT Team" <${process.env.MAIL_USERNAME}>`,
      to: email,
      subject: subject,
      text: textContent,
      html: htmlContent,
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent successfully to:', email);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendPasswordResetEmail(userDetails, resetToken) {
    const { email, firstName, lastName, companyName } = userDetails;
    
    const subject = `Password Reset Request - ${companyName}`;
    const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .warning { background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 10px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          .btn { display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
            <p>${companyName}</p>
          </div>
          
          <div class="content">
            <h2>Hello ${firstName} ${lastName},</h2>
            
            <p>We received a request to reset your password for your ${companyName} expense management account.</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="btn">Reset Your Password</a>
            </div>
            
            <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background-color: #e5e7eb; padding: 10px; border-radius: 5px;">${resetUrl}</p>
            
            <div class="warning">
              <strong>Security Information:</strong>
              <ul>
                <li>This link will expire in 1 hour for security reasons</li>
                <li>If you didn't request this reset, you can safely ignore this email</li>
                <li>Your password won't change until you create a new one</li>
              </ul>
            </div>
            
            <p>If you have any questions or need assistance, please contact your system administrator.</p>
            
            <p>Best regards,<br>
            ${companyName} IT Team</p>
          </div>
          
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>${companyName} Expense Management System</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"${companyName} IT Team" <${process.env.MAIL_USERNAME}>`,
      to: email,
      subject: subject,
      html: htmlContent,
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent successfully to:', email);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      return { success: false, error: error.message };
    }
  }

  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('Email service connection successful');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }
}

module.exports = new EmailService();