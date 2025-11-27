# Task Management API

A robust RESTful API for task management built with Node.js, Express, TypeScript, and MongoDB. Features include user authentication, task CRUD operations, role-based access control, and comprehensive API documentation.

## 🚀 Features

- **Authentication & Authorization**
  - JWT-based authentication with access and refresh tokens
  - Secure password hashing with bcrypt
  - Role-based access control (Admin/User)
  
- **Task Management**
  - Create, read, update, and delete tasks
  - Task status tracking (pending/completed)
  - Search and filter tasks by status, priority, and due date
  - Pagination with cursor-based navigation
  - Access control

- **User Management**
  - User registration and login
  - Role assignment

- **API Documentation**
  - Interactive Swagger/OpenAPI documentation
  - Postman-compatible JSON export

- **Logging & Monitoring**
  - Winston logger with MongoDB transport
  - HTTP request logging with Morgan
  - Environment-based log levels

- **Testing**
  - Comprehensive unit and integration tests
  - 143+ test cases with high coverage
  - In-memory MongoDB for fast testing

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB instance)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Irene-24/task-mgt.git
   cd task-mgt/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the backend directory:
   ```env
   # MongoDB
   MONGO_URI=your-connection-url
   
   # Server
   PORT=5050
   NODE_ENV=development
   
   # JWT
   JWT_SECRET=your-secret-key-change-in-production
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
   JWT_REFRESH_EXPIRES_IN=7d
   
   # Production URL
   PROD_URL=https://your-production-url.com
   ```

4. **Configure MongoDB Atlas**
   - Create a MongoDB Atlas cluster
   - Add your IP address to the Network Access whitelist
   - Create a database user with read/write permissions
   - Copy the connection string to your `.env` file

## 🚀 Running the Application

### Development Mode
```bash
npm dev
```
Starts the server with hot-reloading on port 5050 (or your configured PORT).

### Production Mode
```bash
npm build
npm start
```

### Database Operations
```bash
# Seed the database with sample data
npm seed

# Clear all data from the database
npm db:clear

# Reset database (clear + seed)
npm db:reset
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run tests with coverage report
npm test:coverage

# Run tests with verbose output
npm test:verbose
```

## 📚 API Documentation

Once the server is running, access the interactive API documentation:

- **Swagger UI**: `http://localhost:5050/api-docs`
- **JSON Export**: `http://localhost:5050/api-docs.json` (for Postman import)

### API Endpoints

#### Authentication
- `POST /v1/auth/register` - Register a new user
- `POST /v1/auth/signin` - Login user
- `POST /v1/auth/refresh` - Refresh access token
- `POST /v1/auth/logout` - Logout user

#### Users
- `GET /v1/users/me` - Get current authenticated user
- `GET /v1/users` - Get all users (Admin only)
- `GET /v1/users/:id` - Get user by ID
- `PATCH /v1/users/:id` - Update user profile

#### Tasks
- `GET /v1/tasks/stats` - Get task statistics
- `GET /v1/tasks` - Get all tasks (with pagination, search, filters)
- `GET /v1/tasks/:id` - Get task by ID
- `POST /v1/tasks` - Create a new task
- `PATCH /v1/tasks/:id/toggle-status` - Toggle task status
- `PATCH /v1/tasks/:id` - Update task
- `DELETE /v1/tasks/:id` - Delete task (Admin only)

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── __tests__/              # Test files
│   │   ├── integration/        # API integration tests
│   │   │   ├── auth.api.test.ts
│   │   │   ├── task.api.test.ts
│   │   │   └── user.api.test.ts
│   │   ├── middleware/         # Middleware tests
│   │   │   ├── errorHandler.test.ts
│   │   │   └── validate.middleware.test.ts
│   │   ├── models/             # Model tests
│   │   │   ├── RefreshToken.model.test.ts
│   │   │   ├── Task.model.test.ts
│   │   │   └── User.model.test.ts
│   │   └── unit/               # Unit tests
│   │       └── taskAccess.test.ts
│   ├── config/                 # Configuration files
│   │   ├── appConfig.ts        # App configuration
│   │   ├── db.ts               # Database connection
│   │   └── swagger.ts          # Swagger configuration
│   ├── controllers/            # Request handlers
│   │   ├── auth.controller.ts  # Authentication logic
│   │   ├── task.controller.ts  # Task CRUD operations
│   │   └── user.controller.ts  # User management
│   ├── middleware/             # Custom middleware
│   │   ├── auth.middleware.ts  # Authentication & authorization
│   │   ├── errorHandler.ts     # Error handling
│   │   └── validate.middleware.ts # Request validation
│   ├── models/                 # Mongoose models
│   │   ├── RefreshToken.model.ts
│   │   ├── Task.model.ts
│   │   └── User.model.ts
│   ├── routes/                 # API routes
│   │   └── v1/                 # API version 1
│   │       ├── auth.routes.ts
│   │       ├── index.ts
│   │       ├── task.routes.ts
│   │       └── user.routes.ts
│   ├── scripts/                # Database scripts
│   │   ├── clear.ts            # Clear database
│   │   └── seed.ts             # Seed sample data
│   ├── utils/                  # Utility functions
│   │   ├── constants.ts        # App constants
│   │   ├── logger.ts           # Winston logger
│   │   └── taskAccess.ts       # Task access control helpers
│   ├── validators/             # Zod validation schemas
│   │   ├── auth.validator.ts   # Auth validation schemas
│   │   └── task.validator.ts   # Task validation schemas
│   ├── app.ts                  # Express app setup
│   └── server.ts               # Server entry point
├── dist/                       # Compiled JavaScript (generated)
├── logs/                       # Log files (generated)
├── coverage/                   # Test coverage reports (generated)
├── .env                        # Environment variables (not in git)
├── jest.config.js              # Jest test configuration
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
└── README.md                   
```

## 🔒 Authentication

The API uses JWT tokens for authentication:

1. **Sign up** or **sign in** to receive an access token and refresh token
2. Include the access token in the Authorization header for protected routes:
   ```
   Authorization: Bearer <your-access-token>
   ```



## 🔐 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Role-based access control
- Input validation with Zod
- CORS enabled
- MongoDB injection prevention via Mongoose

## 📊 Database Schema

### User
- `firstName`: string (required)
- `lastName`: string (required)
- `email`: string (unique, required)
- `password`: string (hashed, required)
- `role`: enum ['user', 'admin'] (default: 'user')
- `fullName`: virtual field (firstName + lastName)
- `createdAt`: Date (auto-generated)
- `updatedAt`: Date (auto-generated)

### Task
- `title`: string (required, 3-100 chars)
- `description`: string (optional, max 500 chars)
- `status`: enum ['pending', 'completed'] (default: 'pending')
- `priority`: enum ['low', 'medium', 'high'] (default: 'medium')
- `createdBy`: ObjectId (ref: User, required)
- `assignedTo`: ObjectId (ref: User, optional)
- `createdAt`: Date (auto-generated)
- `updatedAt`: Date (auto-generated)

### RefreshToken
- `token`: string (unique, required)
- `userId`: ObjectId (ref: User, required)
- `expiresAt`: Date (required)


## 🐛 Troubleshooting

### MongoDB Connection Issues
- Verify your IP is whitelisted in MongoDB Atlas Network Access
- Check your connection string format




### Port Already in Use
- Change the `PORT` in your `.env` file
- Or kill the process using the port

## 📝 Development Guidelines


### Running TypeScript
The project uses `tsc-alias` to resolve path aliases (`@/`). Build commands:
```bash
tsc && tsc-alias
```

## 📄 License

ISC



## 📞 Support

For issues and questions, please open an issue in the [GitHub repository](https://github.com/Irene-24/task-mgt/issues).

## 🔗 Links

- **Repository**: [https://github.com/Irene-24/task-mgt](https://github.com/Irene-24/task-mgt)
- **Issues**: [https://github.com/Irene-24/task-mgt/issues](https://github.com/Irene-24/task-mgt/issues)

----
**Built with ❤️ using Node.js, Express, TypeScript, and MongoDB**
