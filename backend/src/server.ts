import { createServer } from "./app";
import { appConfig } from "@/config/appConfig";

const startServer = async () => {
  const app = await createServer();
  const PORT = appConfig.port;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
