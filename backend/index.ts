import express, { Express } from 'express';
import dotenv from 'dotenv';
import { router } from "./router";
import { DB, createAllTables } from './db'
import { cronJobs } from "./cron";

dotenv.config({
    path: '../.env'
});

const app: Express = express();
const port = process.env.PORT || '8000';

const pool = DB.getInstance();
createAllTables(pool);

router(app);
cronJobs();

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});