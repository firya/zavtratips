import express from "express";
import { getPodcasts } from "./podcasts";

export const apiRouter = express.Router();

apiRouter.get("/podcasts", getPodcasts);
