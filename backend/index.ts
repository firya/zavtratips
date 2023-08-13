import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8000;

app.use('/webapp', express.static('../frontend/dist'))
app.use('/webapp/*', express.static('../frontend/dist'))

app.get('/', (req: Request, res: Response) => {
    res.send('Get out! You are not welcome here');
});

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});