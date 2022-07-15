import express, { Request, Response } from "express";
import path from "path";
import Bot, { secretPath } from "./bot";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import router from "./router";
import "./cron";

mongoose.connect(`mongodb://mongo:27017/server`, {
	// authSource: "admin", 
	user: process.env.MONGO_USER,
	pass: process.env.MONGO_PASS,
});

const DB = mongoose.connection;

DB.on("error", console.error.bind(console, "connection error:"));
DB.once("open", function () {
	console.log("MongoDB database connection established successfully");
});

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

router(app);
console.log(secretPath);
app.use(Bot.webhookCallback(secretPath));

app.use(express.static("public", { extensions: ["html"] }));

app.listen(3001, () => {
	console.log(`Example app listening on port 3001!`);
});
