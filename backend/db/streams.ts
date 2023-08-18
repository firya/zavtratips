import pg from "pg";
import { insertIntoTable } from "./common";

export type StreamsRow = {
  row?: number;
  date: string;
  title: string;
  link: string;
  length: string;
};

export const DB_NAME = "zt_streams";

export const createStreamsTable = async (pool: pg.Pool) => {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS ${DB_NAME} (
            row serial PRIMARY KEY,
            date timestamp default NULL,
            title varchar(512),
            link varchar(512),
            length varchar(128)
        );`);
  } catch (e) {
    console.log(e);
  }
};

export const removeStreamsTable = async (pool: pg.Pool) => {
  try {
    await pool.query(`DROP TABLE IF EXISTS ${DB_NAME}`);
  } catch (e) {
    console.log(e);
  }
};

export const clearStreamsTable = async (pool: pg.Pool) => {
  try {
    await pool.query(`TRUNCATE TABLE ${DB_NAME}`);
  } catch (e) {
    console.log(e);
  }
};

export const getStreamsList = async (
  pool: pg.Pool,
): Promise<StreamsRow[] | undefined> => {
  try {
    const res = await pool.query(`SELECT * FROM ${DB_NAME}`);

    return res.rows.length ? res.rows : undefined;
  } catch (e) {
    console.log(e);
  }
};

export const insertIntoStreamsTable = async (
  pool: pg.Pool,
  rows: StreamsRow[],
) => {
  return insertIntoTable(pool, DB_NAME, rows);
};
