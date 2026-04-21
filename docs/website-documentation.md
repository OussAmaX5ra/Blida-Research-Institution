# Blida Research Institute - Website Documentation

## Overview

The Blida Research Institute website is a comprehensive institutional academic platform built with the MERN stack (MongoDB, Express, React, Node.js). It serves as the digital face of a research laboratory, providing public visitors with detailed information about the institute's research teams, members, projects, publications, news, and media gallery. The platform also includes a secure admin portal for managing all content.

## Website URL

- **Public Site**: `http://localhost:5173` (development)
- **Admin Portal**: `http://localhost:5173/admin`
- **API Server**: `http://localhost:3001` (development)

## Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS 4 with custom design tokens
- **Icons**: Lucide React
- **State Management**: React Context API
- **Routing**: React Router

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with HTTP-only cookies
- **Password Hashing**: bcrypt

### Development Tools
- **Testing**: Playwright (E2E)
- **Linting**: ESLint
- **Build**: Vite

## Public Pages

### 1. Home Page (`/`)
The landing page featuring:
- Institute branding and identity
- Mission and vision statements
- Key statistics (team count, member count, publications, projects)
- Featured research teams
- Latest publications
- Recent news items
- Gallery preview
- Call-to-action buttons

### 2. About Page (`/about`)
- Institutional mission and vision
- History and background
- Core research axes
- Values and institutional context

### 3. Research Axes Page (`/axes`)
- Overview of all research axes/themes
- Each axis with description and associated teams

### 4. Teams Page (`/teams`)
- Grid layout of all research teams
- Filter by research axis
- Each team card displays:
  - Team name and acronym
  - Research focus
  - Team leader
  - Member count by role
  - Active project count

### 5. Team Details Page (`/teams/:slug`)
- Full team profile with:
  - Team name, acronym, and description
  - Team leader information
  - Members grouped by role (Professors, Doctors, PhD Students)
  - Active and completed projects
  - Associated publications
  - Research themes/tags

### 6. Members Directory (`/members`)
- Browse all institute members
- Filter by:
  - Role (Professor, Doctor, PhD Student)
  - Team
  - Research theme
- Search by name
- Member cards showing:
  - Name and avatar
  - Academic title
  - Team affiliation
  - Leader badge if applicable

### 7. Projects Page (`/projects`)
- List of all research projects
- Filter by:
  - Team
  - Status (Active, Completed, Pending)
  - Research theme
  - Year
- Project cards displaying:
  - Project title
  - Team association
  - Status badge
  - Start/end dates
  - Lead researcher

### 8. Publications Page (`/publications`)
- Searchable digital library of publications
- Advanced filtering:
  - Search query (title, authors, publisher, tags)
  - Year
  - Team
  - Publisher
  - Author
  - Research theme
- Publication cards showing:
  - Title
  - Authors
  - Publisher/journal
  - Year
  - Team associations
  - PDF link

### 9. Publication Details Page (`/publications/:slug`)
- Full publication metadata
- Abstract/summary
- Team associations
- Export options:
  - BibTeX
  - APA citation

### 10. News Page (`/news`)
- Latest news and updates
- Filter by:
  - Category
  - Team
  - Year
- News cards with:
  - Featured image
  - Headline
  - Date
  - Summary
  - Category badge

### 11. News Details Page (`/news/:slug`)
- Full news story
- Publication date
- Featured image
- Related content links

### 12. Gallery Page (`/gallery`)
- Media gallery with images
- Filter by:
  - Category
  - Team
  - Year
- Search captions
- Lightbox view for images

### 13. PhD Progress Page (`/phd-progress`)
- Visual timeline of PhD research progress
- Milestone states: Proposal, Literature Review, Data Collection, Experimentation, Writing, Submission, Defense/Completed

### 14. Contact Page (`/contact`)
- Contact information:
  - Address
  - Email
  - Phone
- Optional embedded map

### 15. Login Page (`/admin/login`)
- Secure admin authentication
- Email and password login

## Admin Portal

### Dashboard (`/admin`)
- Overview statistics cards
- Recent activity feed
- Quick action buttons
- Status indicators for content

### Teams Management (`/admin/teams`)
- CRUD operations for research teams
- Form fields: name, acronym, description, leader, research focus, themes, status

### Members Management (`/admin/members`)
- CRUD operations for members
- Role assignment: Professor, Doctor, PhD Student
- Fields: name, email, role, bio, team(s), research interests, avatar, display order

### Projects Management (`/admin/projects`)
- CRUD operations for projects
- Fields: title, description, team, lead researcher, dates, status, milestones

### Publications Management (`/admin/publications`)
- CRUD operations for publications
- Fields: title, authors, publisher, year, PDF link, teams, tags, abstract, DOI, type, featured

### News Management (`/admin/news`)
- CRUD operations for news posts
- Fields: headline, date, featured image, content, summary, publish status

### Gallery Management (`/admin/gallery`)
- CRUD operations for media items
- Fields: title, caption, category, date, image, team association

### PhD Progress Management (`/admin/phd-progress`)
- Create and update milestones
- Track student progress through research phases

### User Management (`/admin/users`)
- Create admin accounts
- Assign roles (Super Admin, Content Admin, Editor)
- Activate/deactivate users
- Password reset functionality

### Activity Logs (`/admin/activity`)
- Audit trail of admin actions
- Action types: login, logout, create, update, delete, publish, role_change, lock, password_reset

## Database Collections

### users
- Authentication and authorization data
- Fields: email, password, role, status, createdAt, updatedAt

### teams
- Research team information
- Fields: name, slug, acronym, description, leader, members, projects, themes, color, status

### members
- Individual researchers
- Fields: name, slug, email, role, title, bio, avatar, teams, interests, order, isLeader

### projects
- Research projects
- Fields: title, slug, description, team, lead, startDate, endDate, status, themes

### publications
- Academic publications
- Fields: title, slug, authors, publisher, year, pdfUrl, teams, tags, abstract, doi, type, featured, createdAt

### news
- News articles
- Fields: headline, slug, date, image, content, summary, category, team, published

### gallery
- Media gallery items
- Fields: title, caption, image, category, team, date, order

### phd_progress
- PhD student progress tracking
- Fields: student, project, milestones, currentStage, notes

### activity_logs
- Audit logging
- Fields: user, action, entity, entityId, details, ip, timestamp

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/me` - Get current user

### Public Data
- `GET /api/public/teams` - List teams
- `GET /api/public/teams/:slug` - Get team details
- `GET /api/public/members` - List members
- `GET /api/public/projects` - List projects
- `GET /api/public/publications` - List publications
- `GET /api/public/publications/search` - Search publications
- `GET /api/public/news` - List news
- `GET /api/public/gallery` - List gallery items
- `GET /api/public/phd-progress` - List PhD progress

### Admin API
- Full CRUD for teams, members, projects, publications, news, gallery, users
- Activity log retrieval

## Security Features

- Password hashing with bcrypt
- JWT authentication with HTTP-only cookies
- Role-based access control (RBAC)
- Protected admin routes
- Server-side validation
- Rate limiting
- Input sanitization

## Design System

### Color Palette
- Primary: Teal (`#1a5c6b`)
- Secondary: Rust (`#a4542a`)
- Accent: Gold (`#c9a84c`)
- Background: Off-white (`#f7f5f0`)
- Text: Ink (`#0d1117`)

### Typography
- Display: Custom serif font
- Body: System sans-serif

### Components
- Cards with subtle shadows
- Pill-shaped buttons and inputs
- Rounded corners (large radius)
- Glassmorphism effects
- Gradient accents

## User Roles

### Super Admin
- Full platform access
- User and role management
- All CRUD operations
- Publish/unpublish content

### Content Admin
- Full CRUD on all content
- No user management access

### Editor
- Create and edit content
- Limited delete permissions

## Development Commands

```bash
# Install dependencies
npm install
cd server && npm install

# Run development servers
npm run dev          # Frontend (Vite)
cd server && npm run dev  # Backend (Express)

# Build for production
npm run build

# Run tests
npm run test:e2e     # Playwright tests

# Seed database
cd server && npm run seed
```

## Environment Variables

### Frontend (.env)
- `VITE_API_URL` - Backend API URL
- `VITE_APP_TITLE` - Application title

### Backend (.env)
- `PORT` - Server port
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `NODE_ENV` - Environment (development/production)

## File Structure

```
├── src/                    # React frontend
│   ├── components/         # Reusable UI components
│   ├── pages/              # Page components
│   ├── providers/          # React context providers
│   ├── site/               # Routing and navigation
│   └── index.css           # Global styles
├── server/                 # Express backend
│   └── src/
│       ├── models/         # Mongoose models
│       ├── modules/        # Route handlers and services
│       ├── utils/          # Utilities
│       └── scripts/        # Database scripts
├── public/                 # Static assets
├── tests/                  # E2E tests
└── docs/                   # Documentation
```

## Future Enhancements

- Multi-language localization
- Advanced analytics dashboard
- Real-time collaboration
- Paper upload/storage pipeline
- Public user accounts