import express, {Express, Request, Response} from "express";
import { DB } from "./db";
import { telegramBotInit } from "./bot";

export const router = (app: Express) => {
    const { bot, secretPath } = telegramBotInit();

    app.use('/webapp', express.static('../frontend/dist'))
    app.use('/webapp/*', express.static('../frontend/dist'))

    app.get('/api', async(req: Request, res: Response) => {
        const pool = DB.getInstance();
        const result = await pool.query(`SELECT * FROM zt_accounts`);
        res.json(result.rows)
    });

    app.use(bot.webhookCallback(secretPath));

    app.get('/', (req: Request, res: Response) => {
        res.send('Get out! You are not welcome here');
    });
}