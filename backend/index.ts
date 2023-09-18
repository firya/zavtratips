import express, { Express } from "express";
import dotenv from "dotenv";
import { router } from "./router";
import { createAllTables } from "./db";
import { cronJobs } from "./cron";
import cors from "cors";
import bodyParser from "body-parser";

dotenv.config({
  path: "../.env",
});

const app: Express = express();
const port = process.env.NODE_PORT || "8080";

app.use(cors());
app.use(bodyParser.json());
router(app);
cronJobs();

app.listen(port, async () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);

  await createAllTables();
});

app.setTimeout(30000);
