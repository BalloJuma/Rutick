const User = require('../models/User');
const { generateJWT, generateRefreshToken } = require('../utils/tokenUtils');
const { sendWelcomeEmail } = require('../utils/emailTemplates');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

// Register user
exports.register = async (req, res, next) => {
    try {
        const { firstName, lastName, email, studentId, department, password, confirmPassword } = req.body;

        // Validation
        if (!firstName || !lastName || !email || !studentId || !department || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters'
            });
        }

        // Check if user already exists
        let user = await User.findOne({ where: { email: email.toLowerCase() } });
        if (user) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        user = await User.findOne({ where: { studentId: studentId.toUpperCase() } });
        if (user) {
            return res.status(400).json({
                success: false,
                message: 'Student/Staff ID already registered'
            });
        }

        // Create user
        user = await User.create({
            firstName,
            lastName,
            email: email.toLowerCase(),
            studentId: studentId.toUpperCase(),
            department,
            password,
            role: 'student'
        });

        // Generate verification token
        const verificationToken = user.generateEmailVerificationToken();
        await user.save();

        // Send welcome email
        try {
            await sendWelcomeEmail(user);
        } catch (error) {
            console.error('Failed to send welcome email:', error);
        }

        // Generate JWT
        const token = generateJWT({ id: user.id, role: user.role });

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                department: user.department
            }
        });
    } catch (error) {
        next(error);
    }
};

// Login user
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        console.log('🔐 LOGIN ATTEMPT:', { email, passwordLength: password?.length });

        // Validation
        if (!email || !password) {
            console.log('❌ Missing email or password');
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Check for user
        const user = await User.findOne({ where: { email: email.toLowerCase() } });
        console.log('👤 User lookup:', user ? `Found ${user.email}` : 'Not found');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        console.log('🔑 Password match:', isMatch);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate tokens
        const token = generateJWT({ id: user.id, role: user.role });
        const refreshToken = generateRefreshToken({ id: user.id });

        res.json({
            success: true,
            message: 'Login successful',
            token,
            refreshToken,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                department: user.department,
                avatar: user.avatar
            }
        });
    } catch (error) {
        next(error);
    }
};

// Refresh token
exports.refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token required'
            });
        }

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findByPk(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        const token = generateJWT({ id: user.id, role: user.role });

        res.json({
            success: true,
            token
        });
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid refresh token'
        });
    }
};

// Forgot password
exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ where: { email: email.toLowerCase() } });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const resetToken = user.generateEmailVerificationToken();
        await user.save();

        // Send reset email
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        const html = `
            <h2>Password Reset Request</h2>
            <p>You requested a password reset. Click the link below to reset your password:</p>
            <a href="${resetUrl}">Reset Password</a>
            <p>This link expires in 30 minutes.</p>
        `;

        try {
            const { sendEmail } = require('../utils/emailTemplates');
            await sendEmail(user.email, 'Password Reset Request', html);
        } catch (error) {
            user.passwordResetToken = null;
            user.passwordResetExpires = null;
            await user.save();
            return res.status(500).json({
                success: false,
                message: 'Email could not be sent'
            });
        }

        res.json({
            success: true,
            message: 'Password reset email sent'
        });
    } catch (error) {
        next(error);
    }
};

// Reset password
exports.resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password, confirmPassword } = req.body;

        if (!password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide password and confirmation'
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        // Hash token
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            where: {
                passwordResetToken: hashedToken,
                passwordResetExpires: { [Op.gt]: Date.now() }
            }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        user.password = password;
        user.passwordResetToken = null;
        user.passwordResetExpires = null;
        await user.save();

        const newToken = generateJWT({ id: user.id, role: user.role });

        res.json({
            success: true,
            message: 'Password reset successful',
            token: newToken
        });
    } catch (error) {
        next(error);
    }
};

// Logout
exports.logout = async (req, res, next) => {
    try {
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Get current user
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });

        res.json({
            success: true,
            user
        });
    } catch (error) {
        next(error);
    }
};
