import { createServer } from "./app";
import { appConfig } from "@/config/appConfig";

const startServer = async () => {
  const app = await createServer();
  const PORT = appConfig.port;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

// For Vercel serverless deployment
let appInstance: any = null;

const handleRequest = async (req: any, res: any) => {
  if (!appInstance) {
    appInstance = await createServer();
  }
  return appInstance(req, res);
};

export default handleRequest;

// Only start server if not in serverless environment
if (process.env.VERCEL !== "1") {
  startServer();
}
