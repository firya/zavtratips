import pg from "pg";
import { insertIntoTable } from "./common";

export type PodcastsRow = {
  row?: number;
  date: string;
  podcast: string;
  number: string;
  title: string;
  length: string;
};

export const DB_NAME = "zt_podcasts";

export const createPodcastTable = async (pool: pg.Pool) => {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS ${DB_NAME} (
            row serial PRIMARY KEY,
            date timestamp default NULL,
            podcast varchar(128),
            number varchar(128),
            title varchar(128),
            length varchar(128)
        );`);
  } catch (e) {
    console.log(e);
  }
};

export const removePodcastsTable = async (pool: pg.Pool) => {
  try {
    await pool.query(`DROP TABLE IF EXISTS ${DB_NAME}`);
  } catch (e) {
    console.log(e);
  }
};

export const clearPodcastsTable = async (pool: pg.Pool) => {
  try {
    await pool.query(`TRUNCATE TABLE ${DB_NAME}`);
  } catch (e) {
    console.log(e);
  }
};

export const getPodcastList = async (
  pool: pg.Pool,
): Promise<PodcastsRow[] | undefined> => {
  try {
    const res = await pool.query(`SELECT * FROM ${DB_NAME}`);

    return res.rows.length ? res.rows : undefined;
  } catch (e) {
    console.log(e);
  }
};

export const insertIntoPodcastsTable = async (
  pool: pg.Pool,
  rows: PodcastsRow[],
) => {
  return insertIntoTable(pool, DB_NAME, rows);
};
