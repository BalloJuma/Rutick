/**
 * RUTick - Database Seeding Script
 * Creates sample users and events for testing
 *
 * Usage: npm run seed
 */

const { sequelize } = require('../config/database');
const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
require('../models'); // Load all associations
const { v4: uuidv4 } = require('uuid');

require('dotenv').config();

const seedDatabase = async () => {
    try {
        // Sync database
        await sequelize.sync({ force: true });
        console.log('✅ Database synchronized');

        // Create sample users (use individual create to trigger password hashing)
        const users = [];
        const userData = [
            {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@riarauniversity.ac.ke',
                studentId: 'RU2024001',
                department: 'Computer Science',
                password: 'Password@123',
                role: 'student'
            },
            {
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane.smith@riarauniversity.ac.ke',
                studentId: 'RU2024002',
                department: 'Business',
                password: 'Password@123',
                role: 'student'
            },
            {
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@riarauniversity.ac.ke',
                studentId: 'ADMIN001',
                department: 'Other',
                password: 'Admin@123',
                role: 'admin'
            },
            {
                firstName: 'Staff',
                lastName: 'Member',
                email: 'staff@riarauniversity.ac.ke',
                studentId: 'STAFF001',
                department: 'Other',
                password: 'Staff@123',
                role: 'staff'
            }
        ];

        for (const data of userData) {
            const user = await User.create(data);
            users.push(user);
        }

        console.log(`✅ Created ${users.length} sample users`);

        // Create sample events
        const events = await Event.bulkCreate([
            {
                title: 'Computer Science Symposium 2024',
                description: 'Annual symposium featuring latest research in AI, Machine Learning, and Data Science.',
                category: 'academic',
                date: new Date('2024-11-15'),
                time: '09:00',
                location: 'Main Auditorium',
                capacity: 200,
                organizerId: users[2].id,
                tags: ['cs', 'research', 'tech']
            },
            {
                title: 'Campus Cultural Festival',
                description: 'Celebrate diversity with music, dance, food, and cultural performances.',
                category: 'social',
                date: new Date('2024-11-20'),
                time: '14:00',
                location: 'University Grounds',
                capacity: 500,
                organizerId: users[3].id,
                tags: ['culture', 'festival', 'celebration']
            },
            {
                title: 'Career Fair 2024',
                description: 'Meet top employers and explore career opportunities across various industries.',
                category: 'academic',
                date: new Date('2024-11-25'),
                time: '10:00',
                location: 'Sports Complex',
                capacity: 300,
                organizerId: users[3].id,
                tags: ['career', 'jobs', 'internship']
            }
        ]);

        console.log(`✅ Created ${events.length} sample events`);

        // Create sample registrations
        const registrations = await Registration.bulkCreate([
            {
                userId: users[0].id,
                eventId: events[0].id,
                ticketId: `TICKET-${uuidv4()}`,
                status: 'registered'
            },
            {
                userId: users[1].id,
                eventId: events[1].id,
                ticketId: `TICKET-${uuidv4()}`,
                status: 'registered'
            },
            {
                userId: users[0].id,
                eventId: events[2].id,
                ticketId: `TICKET-${uuidv4()}`,
                status: 'registered'
            }
        ]);

        console.log(`✅ Created ${registrations.length} sample registrations`);

        console.log(`
╔════════════════════════════════════════╗
║   ✅ Database Seeding Complete!        ║
╚════════════════════════════════════════╝

Test Credentials:

STUDENT:
  Email: john.doe@riarauniversity.ac.ke
  Password: Password@123

STAFF:
  Email: staff@riarauniversity.ac.ke
  Password: Staff@123

ADMIN:
  Email: admin@riarauniversity.ac.ke
  Password: Admin@123
        `);

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error.message);
        process.exit(1);
    }
};

seedDatabase();

