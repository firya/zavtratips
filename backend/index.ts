import express, { Express } from "express";
import dotenv from "dotenv";
import { router } from "./router";
import { DB, createAllTables } from "./db";
import { cronJobs } from "./cron";

if (process.env.NODE_ENV === "dev") {
  dotenv.config({
    path: "../.env",
  });
}

const app: Express = express();
const port = process.env.PORT || "8080";

router(app);
cronJobs();

app.listen(port, async () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);

  const pool = DB.getInstance();
  await createAllTables(pool);
});
