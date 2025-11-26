import User from "@/models/User.model";
import Task from "@/models/Task.model";
import { connectDB } from "@/config/db";
import { UserRole, TaskStatus } from "@/utils/constants";
import { logger } from "@/utils/logger";

const seedUsers = [
  {
    email: "admin@example.com",
    password: "Admin@123",
    firstName: "Admin",
    lastName: "User",
    role: UserRole.ADMIN,
    isActive: true,
  },
  {
    email: "john.doe@example.com",
    password: "John@123",
    firstName: "John",
    lastName: "Doe",
    role: UserRole.USER,
    isActive: true,
  },
  {
    email: "jane.smith@example.com",
    password: "Jane@123",
    firstName: "Jane",
    lastName: "Smith",
    role: UserRole.USER,
    isActive: true,
  },
  {
    email: "bob.wilson@example.com",
    password: "Bob@123",
    firstName: "Bob",
    lastName: "Wilson",
    role: UserRole.USER,
    isActive: true,
  },
  {
    email: "alice.brown@example.com",
    password: "Alice@123",
    firstName: "Alice",
    lastName: "Brown",
    role: UserRole.USER,
    isActive: true,
  },
];

const seedTasks = [
  {
    title: "Complete project documentation",
    description:
      "Write comprehensive documentation for the task management system including API endpoints, authentication flow, and deployment instructions.",
    status: TaskStatus.PENDING,
  },
  {
    title: "Review pull requests",
    description:
      "Review and merge pending pull requests from team members. Check code quality, test coverage, and adherence to coding standards.",
    status: TaskStatus.PENDING,
  },
  {
    title: "Fix authentication bug",
    description:
      "Investigate and fix the JWT token refresh issue reported by QA team. The refresh token is not properly revoking old tokens.",
    status: TaskStatus.COMPLETED,
  },
  {
    title: "Implement email notifications",
    description:
      "Set up email notification system using SendGrid or similar service. Send emails for task assignments, completions, and reminders.",
    status: TaskStatus.PENDING,
  },
  {
    title: "Optimize database queries",
    description:
      "Review and optimize slow database queries. Add appropriate indexes and refactor N+1 query issues in task listing endpoint.",
    status: TaskStatus.PENDING,
  },
  {
    title: "Update UI components",
    description:
      "Update task list UI to support drag-and-drop functionality. Implement smooth animations and improve mobile responsiveness.",
    status: TaskStatus.COMPLETED,
  },
  {
    title: "Write unit tests",
    description:
      "Increase test coverage to 80%. Write unit tests for user authentication, task CRUD operations, and edge cases.",
    status: TaskStatus.COMPLETED,
  },
  {
    title: "Deploy to production",
    description:
      "Deploy the latest version to production environment. Run smoke tests and monitor error logs for the first 24 hours.",
    status: TaskStatus.PENDING,
  },
  {
    title: "Client meeting preparation",
    description:
      "Prepare presentation slides for client demo. Include feature overview, roadmap, and Q&A section.",
    status: TaskStatus.PENDING,
  },
  {
    title: "Refactor authentication middleware",
    description:
      "Clean up authentication middleware code. Extract common logic into utility functions and improve error handling.",
    status: TaskStatus.COMPLETED,
  },
  {
    title: "Design new dashboard layout",
    description:
      "Create mockups for the new dashboard design. Focus on data visualization and user-friendly statistics display.",
    status: TaskStatus.PENDING,
  },
  {
    title: "Research third-party integrations",
    description:
      "Investigate integration options with Slack, Microsoft Teams, and Google Calendar for task notifications and syncing.",
    status: TaskStatus.PENDING,
  },
  {
    title: "Performance testing",
    description:
      "Conduct load testing to ensure the application can handle 10,000 concurrent users. Document bottlenecks and optimization opportunities.",
    status: TaskStatus.PENDING,
  },
  {
    title: "Security audit",
    description:
      "Perform comprehensive security audit. Check for SQL injection, XSS, CSRF vulnerabilities, and ensure proper authentication.",
    status: TaskStatus.COMPLETED,
  },
  {
    title: "Migrate to TypeScript",
    description:
      "Gradually migrate JavaScript codebase to TypeScript. Start with models and controllers, then move to routes and utilities.",
    status: TaskStatus.COMPLETED,
  },
];

async function seedDatabase() {
  try {
    // Connect to database
    await connectDB();
    logger.info("Connected to MongoDB");

    // Clear existing data
    logger.info("Clearing existing data...");
    await User.deleteMany({});
    await Task.deleteMany({});
    logger.info("Existing data cleared");

    // Create users
    logger.info("Creating users...");
    const createdUsers = await User.create(seedUsers);
    logger.info(`Created ${createdUsers.length} users`);

    // Log user credentials
    console.log("\n=== User Credentials ===");
    for (const user of seedUsers) {
      console.log(
        `Email: ${user.email} | Password: ${user.password} | Role: ${user.role}`
      );
    }
    console.log("========================\n");

    // Create tasks and assign them to users
    logger.info("Creating tasks...");
    const tasksToCreate = seedTasks.map((task, index) => {
      // Assign tasks to different users (round-robin)
      const userIndex = index % createdUsers.length;
      const createdBy = createdUsers[userIndex]._id;

      // Randomly assign some tasks to other users
      let assignedTo;
      if (Math.random() > 0.5 && createdUsers.length > 1) {
        const assigneeIndex = (userIndex + 1) % createdUsers.length;
        assignedTo = createdUsers[assigneeIndex]._id;
      }

      return {
        ...task,
        createdBy,
        assignedTo,
      };
    });

    const createdTasks = await Task.create(tasksToCreate);
    logger.info(`Created ${createdTasks.length} tasks`);

    // Log summary
    const pendingCount = createdTasks.filter(
      (t) => t.status === TaskStatus.PENDING
    ).length;
    const completedCount = createdTasks.filter(
      (t) => t.status === TaskStatus.COMPLETED
    ).length;

    console.log("\n=== Seeding Summary ===");
    console.log(`Total Users: ${createdUsers.length}`);
    console.log(`Total Tasks: ${createdTasks.length}`);
    console.log(`Pending Tasks: ${pendingCount}`);
    console.log(`Completed Tasks: ${completedCount}`);
    console.log("========================\n");

    logger.info("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    logger.error("Error seeding database:", error);
    process.exit(1);
  }
}

// Run the seed function
// eslint-disable-next-line unicorn/prefer-top-level-await
seedDatabase().catch((error) => {
  logger.error("Unhandled error:", error);
  process.exit(1);
});
