import express, { Request, Response } from "express";
import { getRAWG, searchRAWG } from "../libs/rawg";

export const rawgRouter = express.Router();

rawgRouter.get("/", async (req: Request, res: Response) => {
  const query = (req.query.query as string) || "";

  const result = await searchRAWG(query);
  res.json(result);
});

rawgRouter.get("/more", async (req: Request, res: Response) => {
  const url = (req.query.url as string) || "";

  const result = await getRAWG(url);

  if (!result) {
    res.status(500).send("Something went wrong");
    return;
  }

  res.json({
    image: result.data.background_image,
    platforms: result.data.platforms
      ? result.data.platforms
          .map((platform) => platform.platform.name)
          .join(", ")
      : "",
    rating: result.data.metacritic || "",
    genres: result.data.genres
      ? result.data.genres.map((genre) => genre.name).join(", ")
      : "",
    releasedate: result.data.released ? new Date(result.data.released) : "",
    length:
      result.data.gameplayMain ||
      result.data.gameplayMainExtra ||
      result.data.gameplayCompletionist
        ? `${[
            result.data.gameplayMain,
            result.data.gameplayMainExtra,
            result.data.gameplayCompletionist,
          ]
            .filter((item) => item)
            .join(" / ")} часов`
        : "",
  });
});
