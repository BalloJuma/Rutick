# RUTick - Complete Event Management System

A comprehensive event management platform for Riara University, designed to streamline the way students, faculty, and staff discover, register, and participate in campus events.

**Last Updated:** March 17, 2026 | **Version:** 1.0.0 | **Status:** Production Ready ✅

---

## 📌 Quick Navigation

- **Quick Start**: [5-Minute Setup](#-5-minute-quick-start)
- **Project Structure**: [Directory Organization](#-project-structure)
- **Backend Setup**: [Node.js/Express Guide](#-backend-setup)
- **Frontend Setup**: [SPA Guide](#-frontend-setup)
- **Database**: [PostgreSQL Setup](#-postgresql-setup)
- **Scripts**: [Setup & Utility Scripts](#-scripts--setup-utilities)
- **Configuration**: [Docker & Config Files](#-configuration)
- **API Docs**: [Endpoints Reference](#-api-documentation)
- **Troubleshooting**: [Common Issues](#-troubleshooting)

---

## 💻 Minimum Requirements

- **Node.js 18+** (test with `node --version`)
- **PostgreSQL 12+** (local or cloud)
- **npm 8+** (comes with Node.js)
- **2GB RAM, 500MB disk space**
- **Modern web browser**

---

## 🚀 5-Minute Quick Start

### Terminal 1: Backend
```bash
cd backend
npm install
npm run dev
```
Expected: `✓ PostgreSQL Connected` + `✓ Server running on http://0.0.0.0:5000`

### Terminal 2: Frontend
```bash
python -m http.server 8000
```
Then open: **http://localhost:8000**

### Terminal 3: Seed Data (Optional)
```bash
cd backend
npm run seed
```

**Test Credentials:**
- Student: `john.doe@riarauniversity.ac.ke` / `Password@123`
- Staff: `staff@riarauniversity.ac.ke` / `Staff@123`
- Admin: `admin@riarauniversity.ac.ke` / `Admin@123`

---

## 📋 Features

### User Features
- ✅ User authentication (register, login, password reset)
- ✅ Event discovery and browsing
- ✅ Event registration with QR code tickets
- ✅ Event reminders (24h, 1h, day-of)
- ✅ Event reviews and ratings
- ✅ Attendance tracking
- ✅ Certificate generation and download
- ✅ User profile management
- ✅ Attendance history
- ⚠️ Students cannot create events; create event access is limited to staff/admin

### Admin/Staff Features
- ✅ Create and manage events
- ✅ View registrations and attendance
- ✅ Check-in attendees via QR code
- ✅ Issue and manage certificates
- ✅ Delete events from event feed and detail view (organizer/admin only)
- ✅ Event analytics and statistics
- ✅ User management
- ✅ Email reminders scheduling

### Technical Features
- ✅ Secure JWT-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Email notifications
- ✅ Automated reminders with cron jobs
- ✅ QR code generation and verification
- ✅ RESTful API with proper error handling
- ✅ Data validation and sanitization
- ✅ Rate limiting and security headers
- ✅ PostgreSQL database with Sequelize ORM
- ✅ Responsive mobile-friendly UI

---

## 📁 Project Structure

```
Rutick/
├── README.md                          # Main documentation (this file)
├── .gitignore                        # Git ignore rules
│
├── backend/                          # Node.js Express backend
│   ├── src/
│   │   ├── server.js                # Express app entry point
│   │   ├── config/
│   │   │   ├── database.js          # Sequelize + PostgreSQL setup
│   │   │   └── email.js             # Email configuration
│   │   ├── controllers/             # Request handlers
│   │   │   ├── authController.js
│   │   │   ├── eventController.js
│   │   │   ├── registrationController.js
│   │   │   ├── reviewController.js
│   │   │   ├── certificateController.js
│   │   │   └── userController.js
│   │   ├── routes/                  # API endpoints
│   │   │   ├── authRoutes.js
│   │   │   ├── eventRoutes.js
│   │   │   ├── registrationRoutes.js
│   │   │   ├── reviewRoutes.js
│   │   │   ├── certificateRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── models/                  # Sequelize ORM models
│   │   │   ├── User.js
│   │   │   ├── Event.js
│   │   │   ├── Registration.js
│   │   │   ├── Review.js
│   │   │   ├── Certificate.js
│   │   │   ├── Reminder.js
│   │   │   └── index.js             # Model associations
│   │   ├── middleware/              # Express middleware
│   │   │   ├── auth.js              # JWT authentication
│   │   │   ├── errorHandler.js      # Error handling
│   │   │   └── roles.js             # Role-based access
│   │   ├── scripts/                 # Utility scripts
│   │   │   └── seedDatabase.js      # Populate test data
│   │   └── utils/                   # Helper functions
│   │       ├── emailTemplates.js
│   │       ├── qrCodeUtils.js
│   │       ├── reminderScheduler.js
│   │       └── tokenUtils.js
│   ├── package.json                 # Dependencies
│   ├── .env.example                 # Environment template
│   ├── Dockerfile                   # Docker configuration
│   └── README.md                    # Backend documentation
│
├── frontend/                         # Static HTML/CSS/JavaScript SPA
│   ├── index.html                   # Main HTML entry point
│   ├── styles/
│   │   └── style.css               # CSS stylesheets
│   ├── js/                         # Client-side JavaScript utilities
│   │   ├── api.js                  # API client
│   │   ├── utils.js                # Helper functions
│   │   ├── adminManager.js         # Admin panel
│   │   ├── profileManager.js       # User profile
│   │   ├── eventManager.js         # Event management
│   │   ├── certificateManager.js   # Certificates
│   │   └── reviewManager.js        # Reviews
│   └── README.md                    # Frontend documentation
│
├── config/                          # Configuration files
│   ├── docker-compose.yml          # Docker services
│   └── README.md                    # Configuration guide
│
├── scripts/                         # Utility and setup scripts
│   ├── setup/                      # Installation scripts
│   │   ├── setup.sh               # Linux/Mac setup
│   │   ├── setup.bat              # Windows setup
│   │   ├── harden-security.sh     # Linux/Mac security
│   │   └── harden-security.bat    # Windows security
│   ├── docker-config-validator.js  # Validate Docker config
│   ├── setup-env-generator.js     # Generate .env file
│   ├── update-security.js         # Security updates
│   └── README.md                  # Scripts documentation
│
└── docs/                           # Documentation (archived in README)
    ├── POSTGRES_SETUP.md
    ├── QUICKSTART.md
    ├── And others...
```

---

## 🎯 Backend Setup

### Prerequisites
- Node.js v18+
- PostgreSQL 12+
- npm 8+

### Installation Steps

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Environment Variables (.env)**
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=rutick
   DB_USER=postgres
   DB_PASSWORD=postgres

   # Server
   PORT=5000
   NODE_ENV=development

   # JWT
   JWT_SECRET=your_super_secret_key_here
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   JWT_EXPIRE=7d

   # Email
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASSWORD=your_app_password

   # Frontend
   FRONTEND_URL=http://localhost:8000
   CORS_ORIGIN=http://localhost:8000

   # Rate Limiting
   RATE_LIMIT_WINDOW=15
   RATE_LIMIT_MAX=100
   ```

4. **Seed test data**
   ```bash
   npm run seed
   ```
   Creates 4 test users and 3 sample events

5. **Start development server**
   ```bash
   npm run dev      # Runs on http://localhost:5000
   ```

### npm Scripts

- `npm run dev` - Start development server with nodemon
- `npm run seed` - Populate database with test data
- `npm run test` - Run test suite
- `npm start` - Start production server

### Database Models

**Users**
- UUID primary key
- Email-based authentication
- Role-based access (student/staff/admin)
- Department affiliation
- Password hashing with bcryptjs

**Events**
- Full event metadata
- Capacity management
- Status tracking (upcoming/ongoing/completed/cancelled)
- Organizer assignments
- Category classification

**Registrations**
- Event tickets with unique IDs
- QR code generation
- Check-in tracking
- Cancellation support

**Reviews**
- 1-5 star ratings
- Text reviews
- Like counting
- Verified purchase tracking

**Certificates**
- Automatic issuance on attendance
- Issue/expiry dates
- Revocation support
- Certificate ID tracking

**Reminders**
- Scheduled email notifications
- 24h, 1h, and day-of reminders
- Sent status tracking

---

## 🎨 Frontend Setup

### Prerequisites
- Modern web browser
- Python 3 (for local server) or any HTTP server

### Running the Frontend

**Option 1: Using Python (Recommended)**
```bash
cd /path/to/Rutick
python -m http.server 8000
```

**Option 2: Using Node.js http-server**
```bash
npm install -g http-server
cd frontend
http-server -p 8000
```

**Option 3: VS Code Live Server**
- Install "Live Server" extension
- Right-click on `index.html` → "Open with Live Server"

Then open: **http://localhost:8000**

### Frontend Structure

**Components:**
- **Home Page** - Event listing and search
- **Login** - User authentication
- **Dashboard** - User-specific content
- **Event Details** - Full event information and registration
- **Admin Panel** - Event and user management
- **Profile** - User account settings

### API Integration

The frontend communicates with backend API at `http://localhost:5000`.

**Key API Functions** (in `frontend/js/api.js`):
- User authentication (login/logout)
- Event fetching and filtering
- Event registration
- Certificate management
- Review system
- Admin functions

### Development Tips

**Adding New Features:**
1. Add HTML elements to `index.html`
2. Add CSS styles to `styles/style.css`
3. Add JavaScript logic to appropriate manager file
4. Use `api.js` to communicate with backend

**Key Files:**
- `index.html` - UI/layout
- `styles/style.css` - Styling
- `js/api.js` - API endpoints
- `js/*Manager.js` - Feature logic

---

## 🗄️ PostgreSQL Setup Guide

### Quick Start (4 Steps)

**Step 1: Configure Backend**
```bash
cd backend
npm install
cp .env.example .env
```

**Step 2: Edit .env**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rutick
DB_USER=postgres
DB_PASSWORD=postgres
```

**Step 3: Start PostgreSQL (Choose One)**

**Option A: Using Docker (Easiest)**
```bash
docker run -d -p 5432:5432 --name rutick-postgres \
  -e POSTGRES_PASSWORD=postgres \
  postgres:16-alpine
```

**Option B: Local PostgreSQL**
```bash
# PostgreSQL usually starts automatically
psql --version  # Verify installation
```

**Option C: Cloud PostgreSQL (AWS RDS, Heroku, etc)**
```
Update .env with connection credentials
```

**Step 4: Start Backend**
```bash
npm run dev
```

Expected output:
```
✓ PostgreSQL Connected: localhost:5432
✓ Database models synchronized
✓ Server running on http://0.0.0.0:5000
```

### PostgreSQL vs MongoDB

| Aspect              | MongoDB       | PostgreSQL                                               |
| ------------------- | ------------- | -------------------------------------------------------- |
| **Config Variable** | `MONGODB_URI` | `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` |
| **ORM**             | Mongoose      | Sequelize                                                |
| **Connection Test** | `mongosh`     | `psql`                                                   |
| **Port**            | 27017         | 5432                                                     |
| **ID Format**       | ObjectId      | UUID                                                     |

### PostgreSQL Commands

```bash
# Connect to database
psql -U postgres -h localhost -p 5432 -d rutick

# Inside psql prompt:
\dt              # List tables
\d "users"       # Show users table structure
SELECT COUNT(*) FROM "users";  # Count rows
\q               # Quit
```

### Docker PostgreSQL Commands

```bash
# Start PostgreSQL container
docker run -d -p 5432:5432 --name rutick-postgres \
  -e POSTGRES_PASSWORD=postgres postgres:16-alpine

# View logs
docker logs rutick-postgres

# Stop container
docker stop rutick-postgres

# Remove container
docker rm rutick-postgres
```

### Verification Checklist

```bash
# 1. PostgreSQL is running
psql -U postgres -h localhost -p 5432 -c "SELECT 1"

# 2. Backend is running
curl http://localhost:5000/api/health

# 3. Frontend loads
curl http://localhost:8000 | head -20

# 4. Database has tables
psql -U postgres -h localhost -p 5432 -d rutick -c "\dt"

# 5. Seed data exists
curl http://localhost:5000/api/events
```

### Troubleshooting PostgreSQL

**"ECONNREFUSED 127.0.0.1:5432"**
```bash
# Check PostgreSQL is running
docker ps | grep postgres
# OR
psql --version

# Start PostgreSQL
docker run -d -p 5432:5432 --name rutick-postgres \
  -e POSTGRES_PASSWORD=postgres postgres:16-alpine
```

**"Password authentication failed"**
- Verify .env has correct DB_PASSWORD
- Check PostgreSQL user exists
- If using cloud DB, verify IP whitelist

**"Port 5432 already in use"**
```bash
# Find what's using port
lsof -i :5432  # Mac/Linux
netstat -ano | findstr :5432  # Windows

# Use different port
docker run -d -p 5433:5432 --name rutick-postgres \
  -e POSTGRES_PASSWORD=postgres postgres:16-alpine

# Update .env: DB_PORT=5433
```

**"relation \"users\" does not exist"**
- Backend should auto-create tables on first run
- Check backend logs for errors
- Or run: `npm run seed`

---

## 🔧 Scripts & Setup Utilities

### Setup Scripts

**Linux/Mac:**
```bash
./scripts/setup/setup.sh
```
- Installs dependencies
- Creates PostgreSQL database
- Sets up environment variables
- Seeds test data

**Windows:**
```bash
.\scripts\setup\setup.bat
```
- Windows-specific installations
- Creates directories
- Sets environment variables

### Security Hardening

**Linux/Mac:**
```bash
./scripts/setup/harden-security.sh
```

**Windows:**
```bash
.\scripts\setup\harden-security.bat
```

Features:
- Enforce strong password policies
- Configure SSL/TLS
- Set file permissions
- Enable security headers
- Configure firewall

### Utility Scripts

**Docker Configuration Validator**
```bash
node scripts/docker-config-validator.js
```
Validates:
- YAML syntax
- Image availability
- Port configurations
- Volume mappings

**Environment Setup Generator**
```bash
node scripts/setup-env-generator.js
```
Interactive script for:
- Database credentials
- JWT secrets
- SMTP settings
- API URLs

**Security Updates**
```bash
node scripts/update-security.js
```
Updates:
- npm packages
- Security patches
- Vulnerabilities
- Certificates

---

## ⚙️ Configuration

### Docker Compose

**Services:**
- PostgreSQL database (port 5432)
- pgAdmin (port 5050)

**Usage:**
```bash
docker-compose -f config/docker-compose.yml up -d      # Start
docker-compose -f config/docker-compose.yml down       # Stop
docker-compose -f config/docker-compose.yml logs -f     # Logs
```

**Connection Details:**

PostgreSQL:
- Host: localhost
- Port: 5432
- Database: rutick
- User: postgres
- Password: postgres

pgAdmin:
- URL: http://localhost:5050
- Email: admin@example.com
- Password: admin

**Backup & Restore:**
```bash
# Backup
docker-compose exec postgres pg_dump -U postgres rutick > backup.sql

# Restore
docker-compose exec -T postgres psql -U postgres rutick < backup.sql
```

---

## 🔌 API Documentation

### Authentication Endpoints

```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login user
POST   /api/auth/refresh-token     - Refresh JWT
POST   /api/auth/forgot-password   - Request password reset
POST   /api/auth/reset-password    - Reset password
GET    /api/auth/me                - Get current user
```

### Event Endpoints

```
GET    /api/events                 - Get all events
GET    /api/events/:id             - Get single event
POST   /api/events                 - Create event (staff/admin)
PUT    /api/events/:id             - Update event
DELETE /api/events/:id             - Delete event
GET    /api/events/user/my-events  - Get user's events
```

### Registration Endpoints

```
POST   /api/registrations/events/:eventId/register
DELETE /api/registrations/events/:eventId/unregister
GET    /api/registrations/events/:eventId/registration
GET    /api/registrations/events/:eventId/registrations
POST   /api/registrations/:registrationId/check-in
```

### User Endpoints

```
GET    /api/users/profile/:userId
PUT    /api/users/profile
POST   /api/users/change-password
GET    /api/users/attendance/:userId
GET    /api/users/dashboard/stats
DELETE /api/users/deactivate
```

### Review Endpoints

```
GET    /api/reviews/events/:eventId/reviews
POST   /api/reviews/events/:eventId/reviews
PUT    /api/reviews/:reviewId
DELETE /api/reviews/:reviewId
POST   /api/reviews/:reviewId/like
```

### Certificate Endpoints

```
POST   /api/certificates/events/:eventId/certificates
GET    /api/certificates/users/:userId/certificates
GET    /api/certificates/:certificateId
GET    /api/certificates/events/:eventId/certificates
DELETE /api/certificates/:certificateId
```

---

## 🔐 Security

- **Password Security**: bcryptjs hashing (never plain text)
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Both client and server validation
- **CORS Protection**: Configured for localhost only
- **Rate Limiting**: API endpoints protected
- **Security Headers**: Helmet.js middleware
- **Email Verification**: Email validation on registration
- **Password Reset**: Secure token-based recovery

### Security Best Practices

1. Run setup scripts in trusted environment
2. Review scripts before execution
3. Keep secrets out of version control
4. Use strong passwords in .env
5. Regularly run security updates
6. Enable firewall for production
7. Use HTTPS in production

---

## 💡 Development Workflow

1. **Install dependencies** in `backend/`
2. **Configure** `backend/.env`
3. **Start PostgreSQL**: Docker or local
4. **Run seed data**: `npm run seed`
5. **Start backend**: `npm run dev`
6. **Start frontend**: `python -m http.server 8000`
7. **Open browser**: http://localhost:8000

---

## 🎨 UI/UX Design

- Clean, intuitive user interface
- Gradient color scheme (purple/blue)
- Smooth animations and transitions
- Accessible form controls
- Mobile-first responsive design

### Responsive Breakpoints

- Desktop: 1920px and above
- Tablet: 768px - 1023px
- Mobile: 320px - 767px

---

## 🔄 User Workflow

1. **Registration** → Sign up with university email
2. **Discovery** → Browse events by category
3. **Registration** → Register with one click, get QR ticket
4. **Reminders** → Receive email reminders
5. **Attendance** → Check-in with QR code
6. **Review** → Rate and review event
7. **Certificate** → Download certificate of attendance

---

## 🆘 Troubleshooting

### "Cannot find module"
```bash
cd backend
npm install
```

### "Port already in use"
Change port in `.env`:
```env
PORT=3000  # Or another port
```

### "Database connection failed"
Check:
1. PostgreSQL is running: `psql --version`
2. Credentials in `.env` are correct
3. Database exists: `psql -l | grep rutick`

### "CORS error in frontend"
Frontend URL in `.env` must match browser URL:
```env
FRONTEND_URL=http://localhost:8000
CORS_ORIGIN=http://localhost:8000
```

### "Module 'pg' not found"
```bash
cd backend
npm install
npm install pg
```

### "Permission denied on scripts"
```bash
chmod +x ./scripts/setup/setup.sh
chmod +x ./scripts/setup/harden-security.sh
```

---

## 📚 Additional Resources

- **Sequelize Docs**: https://sequelize.org/docs/v6/
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Express.js Docs**: https://expressjs.com/
- **JWT Docs**: https://jwt.io/
- **Docker Docs**: https://docs.docker.com/

---

## 🚢 Deployment

### Backend (Heroku example)
```bash
cd backend
heroku create your-app-name
git push heroku main
```

### Frontend (Netlify)
```bash
# Deploy the frontend folder to Netlify
```

### Production Checklist
- [ ] Use production PostgreSQL database
- [ ] Set strong JWT secrets
- [ ] Enable HTTPS
- [ ] Configure firewall
- [ ] Set up monitoring
- [ ] Regular backups
- [ ] Security headers enabled
- [ ] CORS properly configured

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

### Code Style
- Use consistent indentation (2 spaces)
- Add comments for complex logic
- Follow existing naming conventions
- Test your changes

---

## 📊 Project Statistics

- **Backend**: Node.js/Express with Sequelize ORM
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Database**: PostgreSQL with UUID keys
- **Authentication**: JWT with bcryptjs
- **API**: RESTful with ~20 endpoints
- **Models**: 6 main database models
- **Features**: 15+ user features
- **Test Users**: 4 (student, staff, admin roles)

---

## 📝 License

This project is licensed under the MIT License.

---

## 👥 Development Team

- **Developer**: AI Assistant
- **Project**: RUTick Event Management System
- **University**: Riara University
- **Status**: Production Ready ✅

---

## 📞 Getting Help

1. Check this README first
2. Review relevant section
3. Check backend/README.md or frontend/README.md
4. Review logs for error details
5. Submit detailed issue on GitHub

---

## 🎯 Next Steps

1. **Clone repository**
2. **Run setup script** (`./scripts/setup/setup.sh`)
3. **Start backend** (`cd backend && npm run dev`)
4. **Start frontend** (`python -m http.server 8000`)
5. **Seed test data** (`npm run seed`)
6. **Open browser** to http://localhost:8000

---

**Version:** 1.0.0
**Last Updated:** March 17, 2026
**Status:** Production Ready ✅
**Maintained by:** Development Team

For detailed information about specific components, refer to the individual README files in subdirectories (backend/, frontend/, config/, scripts/).
