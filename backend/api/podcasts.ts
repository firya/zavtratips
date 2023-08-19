import { Request, Response } from "express";

export const getPodcasts = (req: Request, res: Response) => {
  res.json({
    podcasts: [
      {
        id: 423,
      },
    ],
  });
};
