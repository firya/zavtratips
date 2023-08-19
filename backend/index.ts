import express, { Express } from "express";
import dotenv from "dotenv";
import { router } from "./router";
import { createAllTables } from "./db";
import { cronJobs } from "./cron";
import cors from "cors";

dotenv.config({
  path: "../.env",
});

const app: Express = express();
const port = process.env.NODE_PORT || "8080";

app.use(cors());
router(app);
cronJobs();

app.listen(port, async () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);

  await createAllTables();
});
