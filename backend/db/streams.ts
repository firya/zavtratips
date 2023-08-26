import {
  dropTable,
  getAllTable,
  insertIntoTable,
  truncateTable,
} from "./common";
import { DB } from "./index";

export type StreamsRow = {
  row?: number;
  date: string;
  title: string;
  link: string;
  length: string;
};

export const DB_NAME = "zt_streams";

export const createStreamsTable = async () => {
  const pool = DB.getInstance();

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

export const removeStreamsTable = async () => {
  try {
    await dropTable(DB_NAME);
  } catch (e) {
    console.log(e);
  }
};

export const clearStreamsTable = async () => {
  try {
    await truncateTable(DB_NAME);
  } catch (e) {
    console.log(e);
  }
};

export const getStreamsList = async (
  fields: string[] = [],
): Promise<StreamsRow[] | undefined> => {
  try {
    return await getAllTable(DB_NAME, "date", "DESC", fields);
  } catch (e) {
    console.log(e);
  }
};

export const insertIntoStreamsTable = async (rows: StreamsRow[]) => {
  return insertIntoTable(DB_NAME, rows);
};
