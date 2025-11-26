import { createServer } from "../src/app";

let appInstance: any = null;

export default async function handler(req: any, res: any) {
  if (!appInstance) {
    appInstance = await createServer();
  }
  return appInstance(req, res);
}
