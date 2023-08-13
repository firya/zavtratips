import express, { Express } from 'express';
import dotenv from 'dotenv';
import { router } from "./src/router";
import { createDB } from './src/db'

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8000;

createDB()

router(app);

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});