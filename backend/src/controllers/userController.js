const User = require('../models/User');
const Registration = require('../models/Registration');
const Certificate = require('../models/Certificate');
const Reminder = require('../models/Reminder');
const Event = require('../models/Event');
const { Op } = require('sequelize');

// Get user profile
exports.getUserProfile = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const user = await User.findByPk(userId, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get user stats
        const registrations = await Registration.count({
            where: { userId, status: 'registered' }
        });
        const attendance = await Registration.count({
            where: { userId, status: 'checked-in' }
        });
        const certificates = await Certificate.count({
            where: { userId, status: 'issued' }
        });

        res.json({
            success: true,
            user: {
                ...user.get({ plain: true }),
                stats: {
                    registeredEvents: registrations,
                    attendedEvents: attendance,
                    certificates
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// Update user profile
exports.updateUserProfile = async (req, res, next) => {
    try {
        const { firstName, lastName, bio, phone, department, avatar } = req.body;

        let user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (bio) user.bio = bio;
        if (phone) user.phone = phone;
        if (department) user.department = department;
        if (avatar) user.avatar = avatar;

        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                bio: user.bio,
                phone: user.phone,
                department: user.department,
                avatar: user.avatar
            }
        });
    } catch (error) {
        next(error);
    }
};

// Change password
exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all password fields'
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'New passwords do not match'
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters'
            });
        }

        const user = await User.findByPk(req.user.id);

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Get user's attendance record
exports.getAttendanceRecord = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const registrations = await Registration.findAll({
            where: { userId, status: 'checked-in' },
            include: [{
                association: 'event',
                attributes: ['id', 'title', 'date', 'location']
            }],
            order: [['checkedInAt', 'DESC']]
        });

        res.json({
            success: true,
            count: registrations.length,
            attendanceRecord: registrations
        });
    } catch (error) {
        next(error);
    }
};

// Get user reminders
exports.getMyReminders = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const reminders = await Reminder.findAll({
            where: { userId },
            include: [{
                association: 'event',
                model: Event,
                attributes: ['id', 'title', 'date', 'time', 'location']
            }],
            order: [['scheduledFor', 'ASC']]
        });

        res.json({
            success: true,
            reminders
        });
    } catch (error) {
        next(error);
    }
};

// Mark reminder as read
exports.markReminderAsRead = async (req, res, next) => {
    try {
        const { reminderId } = req.params;
        const userId = req.user.id;

        const reminder = await Reminder.findOne({
            where: { id: reminderId, userId }
        });

        if (!reminder) {
            return res.status(404).json({ success: false, message: 'Reminder not found' });
        }

        reminder.read = true;
        await reminder.save();

        res.json({ success: true, message: 'Reminder marked as read' });
    } catch (error) {
        next(error);
    }
};

// Deactivate account
exports.deactivateAccount = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.isActive = false;
        await user.save();

        res.json({
            success: true,
            message: 'Account deactivated successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Get user dashboard stats
exports.getDashboardStats = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const totalRegistrations = await Registration.countDocuments({ user: userId });
        const attendedEvents = await Registration.countDocuments({ user: userId, status: 'checked-in' });
        const upcomingEvents = await Registration.aggregate([
            {
                $match: { user: require('mongoose').Types.ObjectId(userId), status: 'registered' }
            },
            {
                $lookup: {
                    from: 'events',
                    localField: 'event',
                    foreignField: '_id',
                    as: 'eventData'
                }
            },
            {
                $match: { 'eventData.date': { $gt: new Date() } }
            }
        ]);

        const Certificate = require('../models/Certificate');
        const certificates = await Certificate.countDocuments({ user: userId, status: 'issued' });

        const totalEvents = await Event.countDocuments({ isDeleted: false });

        res.json({
            success: true,
            stats: {
                totalEvents,
                registeredEvents: totalRegistrations,
                attendedEvents,
                upcomingEvents: upcomingEvents.length,
                certificates
            }
        });
    } catch (error) {
        next(error);
    }
};
