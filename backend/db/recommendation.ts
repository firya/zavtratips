import pg from "pg";
import { insertIntoTable } from "./common";
import { StreamsRow } from "./streams";

export type RecommendationsRow = {
  row?: number;
  date: string;
  podcast: string;
  type: string;
  title: string;
  link: string;
  image: string;
  platforms: string;
  rating: string;
  genres: string;
  releaseDate: string;
  length: string;
  dima: string;
  timur: string;
  maksim: string;
  guest: string;
};

export const DB_NAME = "zt_recommendations";

export const createRecommendationsTable = async (pool: pg.Pool) => {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS ${DB_NAME} (
            row serial PRIMARY KEY,
            date timestamp default NULL,
            podcast varchar(128),
            type varchar(128),
            title varchar(512),
            link varchar(512),
            image varchar(512),
            platforms varchar(256),
            rating varchar(16),
            genres varchar(256),
            releaseDate timestamp default NULL,
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

export const removeRecommendationsTable = async (pool: pg.Pool) => {
  try {
    await pool.query(`DROP TABLE IF EXISTS ${DB_NAME}`);
  } catch (e) {
    console.log(e);
  }
};

export const clearRecommendationsTable = async (pool: pg.Pool) => {
  try {
    await pool.query(`TRUNCATE TABLE ${DB_NAME}`);
  } catch (e) {
    console.log(e);
  }
};

export const insertIntoRecommendationsTable = async (
  pool: pg.Pool,
  rows: StreamsRow[],
) => {
  return insertIntoTable(pool, DB_NAME, rows);
};
