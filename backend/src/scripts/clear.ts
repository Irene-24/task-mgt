import { connectDB } from "@/config/db";
import User from "@/models/User.model";
import Task from "@/models/Task.model";
import RefreshToken from "@/models/RefreshToken.model";
import { logger } from "@/utils/logger";

async function clearDatabase() {
  try {
    // Connect to database
    await connectDB();
    logger.info("Connected to MongoDB");

    // Clear all collections
    logger.info("Clearing all data...");

    const userResult = await User.deleteMany({});
    const taskResult = await Task.deleteMany({});
    const tokenResult = await RefreshToken.deleteMany({});

    console.log("\n=== Clear Summary ===");
    console.log(`Users deleted: ${userResult.deletedCount}`);
    console.log(`Tasks deleted: ${taskResult.deletedCount}`);
    console.log(`Refresh tokens deleted: ${tokenResult.deletedCount}`);
    console.log("=====================\n");

    logger.info("Database cleared successfully!");
    process.exit(0);
  } catch (error) {
    logger.error("Error clearing database:", error);
    process.exit(1);
  }
}

// Run the clear function
// eslint-disable-next-line unicorn/prefer-top-level-await
clearDatabase().catch((error) => {
  logger.error("Unhandled error:", error);
  process.exit(1);
});
