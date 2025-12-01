# Task Management System

A full-stack task management application with role-based access control, built with modern web technologies.

## 📋 Overview

This is a repo containing a robust task management system with a RESTful API backend and a modern Next.js frontend. The application supports user authentication, task CRUD operations, advanced filtering, pagination, and role-based permissions.

## 🏗️ Project Structure

```
task-mgt-dev/
├── backend/          # Node.js + Express + MongoDB API
└── frontend/         # Next.js 16 + React + Redux Toolkit
```

## ✨ Key Features

### Authentication & Authorization
- JWT-based authentication with access and refresh tokens
- Role-based access control (Admin/User)
- Secure session management with HTTP-only cookies
- Automatic token refresh

### Task Management
- Create, read, update, and delete tasks
- Task assignment to users
- Status tracking (pending/completed)
- Due date tracking with calendar picker
- Search and advanced filtering
- Cursor-based pagination with virtualization
- Grid and list view modes

### User Experience
- Responsive design (mobile, tablet, desktop)
- Dark/light/system theme switcher
- Real-time statistics dashboard
- Toast notifications
- Loading states and error handling
- Interactive API documentation (Swagger)

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- MongoDB Atlas account (or local MongoDB instance)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd task-mgt-dev
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   ```
   
   Create a `.env` file in the backend directory:
   ```env
   MONGO_URI=your-mongodb-connection-string
   PORT=5050
   NODE_ENV=development
   JWT_SECRET=your-secret-key
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_SECRET=your-refresh-secret-key
   JWT_REFRESH_EXPIRES_IN=7d
   PROD_URL=https://your-production-url.com
   ```

3. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   ```
   
   Create a `.env.local` file in the frontend directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5050/v1
   ```

### Running the Application

**Backend** (from `backend/` directory):
```bash
# Development mode
npm run dev

# Seed database with sample data
npm run seed

# Run tests
npm test
```

**Frontend** (from `frontend/` directory):
```bash
# Development mode (runs on port 7878)
npm run dev

# Run E2E tests
npm run test:e2e
```

Access the application:
- **Frontend**: http://localhost:7878
- **Backend API**: http://localhost:5050
- **API Documentation**: http://localhost:5050/api-docs

## 🧪 Testing

### Backend
- 100+ test cases covering unit and integration tests
- Jest with in-memory MongoDB for fast testing
- Comprehensive API endpoint testing

### Frontend
- 17 E2E tests using Playwright
- Tests cover authentication, CRUD operations, filtering, and role-based permissions
- Configured for serial execution to prevent database conflicts

## 📚 Documentation

For detailed information about each part of the system, see:

- **[Backend Documentation](./backend/README.md)** - API endpoints, database schema, authentication, deployment
- **[Frontend Documentation](./frontend/README.md)** - Component architecture, state management, UI features, development guide

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt
- **Validation**: Zod schemas
- **Documentation**: Swagger/OpenAPI
- **Logging**: Winston with MongoDB transport
- **Testing**: Jest with Supertest

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **State Management**: Redux Toolkit + RTK Query
- **UI Components**: Radix UI + shadcn/ui
- **Styling**: Tailwind CSS v4
- **Forms**: React Hook Form + Zod validation
- **Testing**: Playwright (E2E)
- **Virtualization**: TanStack Virtual

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- HTTP-only cookies for refresh tokens
- Role-based access control
- Input validation with Zod
- CORS configuration
- MongoDB injection prevention
- Environment variable management

## 📊 Database Schema

### User
- User profile with first/last name and email
- Role assignment (USER/ADMIN)
- Password hashing and authentication

### Task
- Title, description, and status
- Due date tracking
- User assignment (assignedTo, createdBy, updatedBy)
- Timestamps for creation and updates

### RefreshToken
- Secure token storage
- Expiration management
- User association

## 🤝 Contributing

1. Follow TypeScript strict mode
2. Write tests for new features
3. Use existing component and API patterns
4. Ensure proper error handling
5. Update documentation as needed

## 📄 License

ISC

---

**Built with ❤️ using Node.js, Express, Next.js, TypeScript, and MongoDB**
