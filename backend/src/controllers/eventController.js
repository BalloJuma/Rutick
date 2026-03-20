const Event = require('../models/Event');
const User = require('../models/User');
const Registration = require('../models/Registration');
const Review = require('../models/Review');
const { generateTicketId } = require('../utils/tokenUtils');
const { generateQRCode } = require('../utils/qrCodeUtils');
const { sendEventRegistrationEmail } = require('../utils/emailTemplates');
const { Op, Sequelize } = require('sequelize');

// Get all events
exports.getAllEvents = async (req, res, next) => {
    try {
        const { category, search, page = 1, limit = 20, sort = 'createdAt' } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;

        let where = {};

        if (category && category !== 'all') {
            where.category = category;
        }

        if (search) {
            where[Op.or] = [
                { title: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } },
                Sequelize.where(
                    Sequelize.fn('array_position', Sequelize.col('tags'), search),
                    Op.gt,
                    0
                )
            ];
        }

        const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
        const sortOrder = sort.startsWith('-') ? 'DESC' : 'ASC';

        const { count, rows: events } = await Event.findAndCountAll({
            where,
            include: [{
                association: 'organizer',
                model: User,
                attributes: ['id', 'firstName', 'lastName', 'email']
            }],
            order: [[sortField, sortOrder]],
            offset,
            limit: limitNum
        });

        // If user is logged in, add registration status
        let eventsWithStatus = events;
        if (req.user) {
            eventsWithStatus = await Promise.all(events.map(async (event) => {
                const registration = await Registration.findOne({
                    where: { userId: req.user.id, eventId: event.id }
                });
                return {
                    ...event.get({ plain: true }),
                    isRegistered: !!registration
                };
            }));
        }

        res.json({
            success: true,
            count: events.length,
            total: count,
            pages: Math.ceil(count / limitNum),
            currentPage: pageNum,
            events: eventsWithStatus
        });
    } catch (error) {
        next(error);
    }
};

// Get single event
exports.getEvent = async (req, res, next) => {
    try {
        const { id } = req.params;

        const event = await Event.findByPk(id, {
            include: [{
                association: 'organizer',
                model: User,
                attributes: ['id', 'firstName', 'lastName', 'email', 'department']
            }]
        });

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Get reviews
        const reviews = await Review.findAll({
            where: { eventId: id },
            include: [{
                association: 'user',
                model: User,
                attributes: ['id', 'firstName', 'lastName', 'avatar']
            }],
            order: [['createdAt', 'DESC']]
        });

        let isRegistered = false;
        if (req.user) {
            const registration = await Registration.findOne({
                where: { userId: req.user.id, eventId: id }
            });
            isRegistered = !!registration;
        }

        res.json({
            success: true,
            event: {
                ...event.get({ plain: true }),
                isRegistered,
                reviews
            }
        });
    } catch (error) {
        next(error);
    }
};

// Create event (staff/admin only)
exports.createEvent = async (req, res, next) => {
    try {
        const { title, description, category, date, time, duration, location, capacity, tags, image } = req.body;

        // Validation
        if (!title || !description || !category || !date || !time || !location || !capacity) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        const eventDate = new Date(`${date}T${time}`);
        if (eventDate < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Event date cannot be in the past'
            });
        }

        const event = await Event.create({
            title,
            description,
            category,
            date: eventDate,
            time,
            duration,
            location,
            capacity,
            tags: tags ? tags.split(',').map(t => t.trim()) : [],
            banner: image || null, // Store base64 image as banner
            organizerId: req.user.id
        });

        const populatedEvent = await event.reload({
            include: [{
                association: 'organizer',
                model: User,
                attributes: ['id', 'firstName', 'lastName', 'email']
            }]
        });

        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            event: populatedEvent
        });
    } catch (error) {
        next(error);
    }
};

// Update event
exports.updateEvent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, category, date, time, location, capacity, tags } = req.body;

        let event = await Event.findByPk(id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Check authorization
        if (event.organizerId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this event'
            });
        }

        if (title) event.title = title;
        if (description) event.description = description;
        if (category) event.category = category;
        if (date && time) {
            const eventDate = new Date(`${date}T${time}`);
            if (eventDate < new Date()) {
                return res.status(400).json({
                    success: false,
                    message: 'Event date cannot be in the past'
                });
            }
            event.date = eventDate;
            event.time = time;
        }
        if (location) event.location = location;
        if (capacity) event.capacity = capacity;
        if (tags) event.tags = tags.split(',').map(t => t.trim());

        await event.save();

        res.json({
            success: true,
            message: 'Event updated successfully',
            event
        });
    } catch (error) {
        next(error);
    }
};

// Delete event
exports.deleteEvent = async (req, res, next) => {
    try {
        const { id } = req.params;

        const event = await Event.findByPk(id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Check authorization
        if (event.organizerId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this event'
            });
        }

        await event.destroy();

        res.json({
            success: true,
            message: 'Event deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Get user's registered events
exports.getMyEvents = async (req, res, next) => {
    try {
        const registrations = await Registration.findAll({
            where: { userId: req.user.id },
            include: [{
                association: 'event',
                model: Event
            }],
            order: [['createdAt', 'DESC']]
        });

        const events = registrations.map(reg => ({
            ...reg.event.get({ plain: true }),
            registrationStatus: reg.status,
            ticketId: reg.ticketId,
            registeredAt: reg.createdAt
        }));

        res.json({
            success: true,
            count: events.length,
            events
        });
    } catch (error) {
        next(error);
    }
};
