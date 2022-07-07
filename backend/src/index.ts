import express, { Request, Response } from "express";
import Bot, { secretPath } from "./bot";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import router from "./router";
import "./cron";

mongoose.connect(`mongodb://mongo:27017`);

const DB = mongoose.connection;

DB.on("error", console.error.bind(console, "connection error:"));
DB.once("open", function () {
	console.log("MongoDB database connection established successfully");
});

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.get("/", (req: Request, res: Response) =>
	res.send("These aren't the droids you're looking for.")
);

router(app);

app.use(express.static("public", { extensions: ["html"] }));
app.use(Bot.webhookCallback(secretPath));

app.use(function (req, res) {
	res.status(404).send({ url: req.originalUrl + " not found" });
});

app.listen(process.env.NODE_PORT, () => {
	console.log(`Example app listening on port ${process.env.NODE_PORT}!`);
});
