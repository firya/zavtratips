import express, { Express } from "express";
import { router } from "./router";
import { DB, createAllTables } from "./db";
import { cronJobs } from "./cron";

const app: Express = express();
const port = process.env.PORT || "8080";

console.log(process.env);

router(app);
cronJobs();

app.listen(port, async () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);

  const pool = DB.getInstance();
  await createAllTables(pool);
});
