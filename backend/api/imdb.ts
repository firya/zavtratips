import express, { Request, Response } from "express";
import { getIMDB, searchIMDB } from "../libs/imdb";

export const imdbRouter = express.Router();

imdbRouter.get("/", async (req: Request, res: Response) => {
  const query = (req.query.query as string) || "";

  const result = await searchIMDB(query);
  res.json(result);
});

imdbRouter.get("/more", async (req: Request, res: Response) => {
  const url = (req.query.url as string) || "";

  const result = await getIMDB(url);

  if (!result) {
    res.status(500).send("Something went wrong");
    return;
  }

  res.json({
    image:
      result.data.Poster && result.data.Poster !== "N/A"
        ? result.data.Poster
        : "https://lh3.googleusercontent.com/proxy/9x18kFTI33ntQXwjFLGyaoXRVr13wziRUrSFUNlvjJ6EF5jN8QlGSXFDJClMsZ3QzepLH9Ti_XXlegFGbfW7zxWpNiN9R1hL6iHktnIBq1rS3DI64wQTx-Pfgct5Jzy7id887McTNABuP82DAWec",
    platforms: "",
    rating: result.data.imdbRating || "",
    genres: result.data.Genre || "",
    releasedate: result.data.Released ? new Date(result.data.Released) : "",
    length:
      result.data.Runtime && result.data.Runtime !== "N/A"
        ? result.data.Runtime.replace("min", "мин")
        : "",
  });
});
