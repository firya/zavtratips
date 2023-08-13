import express, {Express, Request, Response} from "express";
import {DB} from "./db";

export const router = (app: Express) => {
    app.use('/webapp', express.static('../frontend/dist'))
    app.use('/webapp/*', express.static('../frontend/dist'))

    app.get('/api', async(req: Request, res: Response) => {
        const pool = DB.getInstance();
        const result = await pool.query(`SELECT * FROM zt_accounts`);
        res.json(result.rows)
    });

    app.get('/', (req: Request, res: Response) => {
        res.send('Get out! You are not welcome here');
    });
}