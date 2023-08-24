import {
  dropTable,
  findInTableStrict,
  getAllTable,
  insertIntoTable,
  truncateTable,
} from "./common";
import { DB } from "./index";

export type RecommendationsRow = {
  row?: number;
  date: string;
  podcast: string;
  type: string;
  title: string;
  link: string;
  image: string;
  description: string;
  platforms: string;
  rating: string;
  genres: string;
  releasedate: string;
  length: string;
  dima: string;
  timur: string;
  maksim: string;
  guest: string;
};

export const DB_NAME = "zt_recommendations";

export const createRecommendationsTable = async () => {
  const pool = DB.getInstance();
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS ${DB_NAME} (
            row serial PRIMARY KEY,
            date timestamp default NULL,
            podcast varchar(128),
            type varchar(128),
            title varchar(512),
            link varchar(512),
            image varchar(512),
            description varchar(1024),
            platforms varchar(256),
            rating varchar(16),
            genres varchar(256),
            releasedate timestamp default NULL,
            length varchar(256),
            dima varchar(256),
            timur varchar(256),
            maksim varchar(256),
            guest varchar(256)
        );`);
  } catch (e) {
    console.log(e);
  }
};

export const removeRecommendationsTable = async () => {
  try {
    await dropTable(DB_NAME);
  } catch (e) {
    console.log(e);
  }
};

export const clearRecommendationsTable = async () => {
  try {
    await truncateTable(DB_NAME);
  } catch (e) {
    console.log(e);
  }
};

export const getRecommendationList = async (): Promise<
  RecommendationsRow[] | undefined
> => {
  try {
    return await getAllTable(DB_NAME, "date");
  } catch (e) {
    console.log(e);
  }
};

export const getRecommendationByPodcast = async (
  podcast: string,
): Promise<RecommendationsRow[] | undefined> => {
  try {
    return await findInTableStrict<RecommendationsRow>({
      tableName: DB_NAME,
      queryParam: "podcast",
      queryString: podcast,
      sortBy: "type",
      page: 1,
      limit: 100,
    });
  } catch (e) {
    console.log(e);
  }
};

export const insertIntoRecommendationsTable = async (
  rows: RecommendationsRow[],
) => {
  return insertIntoTable(DB_NAME, rows);
};
