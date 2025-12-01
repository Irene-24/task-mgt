# Task Management - Frontend

A modern task management application built with Next.js 16.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript,CSS (Tailwind)
- **State Management**: Redux Toolkit + RTK Query
- **UI Components**: Radix UI + shadcn/ui
- **Styling**: Tailwind CSS v4
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Virtualization**: TanStack Virtual

## Features

### Authentication
- Login/Register with JWT tokens
- Automatic token refresh
- Protected routes
- Session management with HTTP-only cookies

### Task Management
- ✅ Create, read, update, delete tasks
- ✅ Cursor-based pagination with "Load More" button
- ✅ Virtualization for performance with large lists
- ✅ Task statistics dashboard (total, pending, completed)
- ✅ Advanced filtering (status, search, assignee)
- ✅ Task assignment to users
- ✅ Due date tracking with calendar picker
- ✅ Grid and list view modes


### User Management
- User roles (USER, ADMIN)
- Admin-only delete permissions
- User assignment dropdown with search

### UI/UX
- Responsive design (mobile, tablet, desktop)
- Dark/light/system theme switcher
- Toast notifications (sonner)
- Loading skeletons
- Error handling with user-friendly messages
- Accessible components (Radix UI)
- ScrollArea for mobile forms

## Getting Started

### Prerequisites
- Node.js 18+ (or use pnpm/yarn)
- Backend API running on `http://localhost:5050` (or configure `NEXT_PUBLIC_API_URL`)

### Installation

```bash
# Install dependencies
npm install
# or
pnpm install
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5050/v1
```

### Development

```bash
# Run development server (port 7878)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

The app will be available at [http://localhost:7878](http://localhost:7878)

## Project Structure

```
frontend/
├── app/                      # Next.js app router
│   ├── (auth)/              # Auth pages (login, register)
│   ├── dashboard/           # Protected dashboard page
│   ├── layout.tsx           # Root layout with providers
│   └── globals.css          # Global styles
├── components/
│   ├── Dashboard/           # Dashboard components
│   │   ├── AppSidebar.tsx   # Sidebar with stats
│   │   └── Tasks/           # Task-related components
│   │       ├── TaskForm.tsx        # Create/edit form
│   │       ├── TaskList.tsx        # List with virtualization
│   │       ├── TaskCard.tsx        # Grid view card
│   │       ├── TaskRow.tsx         # List view row
│   │       ├── TaskActions.tsx     # Action dropdown
│   │       ├── TaskStats.tsx       # Stats widget
│   │       ├── CreateTask.tsx      # Create modal
│   │       ├── EditTask.tsx        # Edit modal
│   │       ├── DeleteTask.tsx      # Delete confirmation
│   │       └── UpdateTaskStatus.tsx # Quick status update
│   ├── ui/                  # shadcn/ui components
│   └── shared/              # Shared utilities
├── lib/
│   ├── redux/
│   │   ├── store.ts         # Redux store config
│   │   ├── services/        # RTK Query APIs
│   │   │   ├── base.ts              # Base API with reauth
│   │   │   ├── task.ts              # Task endpoints
│   │   │   ├── user.ts              # User endpoints
│   │   │   └── auth-session.ts      # Auth endpoints
│   │   └── slices/          # Redux slices
│   │       └── auth.slice.ts        # Auth state
│   ├── utils.ts             # Utility functions
│   └── constants.ts         # App constants
├── hooks/                   # Custom React hooks
│   ├── useLoggedInUser.ts   # Current user hook
│   └── useLogout.ts         # Logout hook
└── types/                   # TypeScript types
    ├── task.types.ts
    ├── user.types.ts
    └── auth.types.ts
```

## Key Features Implementation

### Pagination with Virtualization
Uses RTK Query's infinite query + TanStack Virtual for performance:
- Cursor-based pagination with "Load More" button
- Loads 20 tasks per page
- Virtual scrolling renders only visible items

### Cache Updates
Manual cache updates prevent unnecessary refetches:
- Update task: Updates all cached queries with new data
- Delete task: Removes from all cached queries
- Toggle status: Updates task status in all cached queries

### Form Validation
Zod schemas with React Hook Form:
- Title: 3-100 characters
- Description: 10-1000 characters
- Status: Required enum (PENDING, COMPLETED)
- Due date: Optional date
- Assigned to: Optional user selection

### Theme System
- Light mode
- Dark mode
- System preference detection
- Persistent selection

## API Integration

### RTK Query Services

**Task API** (`lib/redux/services/task.ts`):
- `useGetTasksInfiniteQuery` - Paginated tasks with cursor
- `useGetTaskStatsQuery` - Task statistics
- `useGetTaskByIdQuery` - Single task details
- `useCreateTaskMutation` - Create task
- `useUpdateTaskMutation` - Update task
- `useDeleteTaskMutation` - Delete task (admin only)

**User API** (`lib/redux/services/user.ts`):
- `useGetMeQuery` - Current user
- `useGetAllUsersQuery` - All users (for assignment)

**Auth API** (`lib/redux/services/auth-session.ts`):
- `useLoginMutation` - Login
- `useLogoutMutation` - Logout
- `useRefreshMutation` - Refresh token
- `useRegisterMutation` - Register

### Automatic Token Refresh
Base query with mutex-protected reauth:
- Intercepts 401 errors
- Attempts token refresh
- Retries original request
- Clears credentials on failure

## Performance Optimizations

1. **Virtual Scrolling**: Only renders visible tasks in viewport
2. **Optimistic Cache Updates**: Manual cache updates prevent unnecessary refetches
3. **Debounced Search**: 500ms debounce on search input
4. **Cursor-based Pagination**: Efficient data loading with "Load More"
5. **Font Optimization**: next/font with Geist font



## Development Tips

### Adding New Components
```bash
# Using shadcn/ui CLI
npx shadcn@latest add [component-name]
```

### Debugging Redux State
Install Redux DevTools extension to inspect:
- API query cache
- Auth state
- Query status and errors

### Common Issues

**Port 7878 already in use:**
```bash
# Kill process on port 7878
lsof -ti:7878 | xargs kill -9
```

**API connection errors:**
- Verify backend is running
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure CORS is configured on backend



## Contributing

1. Follow TypeScript strict mode
2. Use existing component patterns
3. Add proper type definitions
4. Test on mobile and desktop
5. Ensure dark mode compatibility

## License

This project is part of a task management system case study.
