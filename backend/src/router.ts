import express, {Express, Request, Response} from "express";

export const router = (app: Express) => {
    app.use('/webapp', express.static('../frontend/dist'))
    app.use('/webapp/*', express.static('../frontend/dist'))

    app.get('/api', async(req: Request, res: Response) => {

    });

    app.get('/', (req: Request, res: Response) => {
        res.send('Get out! You are not welcome here');
    });
}