import PGformat from "pg-format";
import { DB } from "./index";
import { dropTable, truncateTable } from "./common";

export type ConfigRow = {
  id?: number;
  key: string;
  value: string;
};

const DB_NAME = "zt_config";

export const createConfigTable = async () => {
  const pool = DB.getInstance();
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS ${DB_NAME} (
            id serial PRIMARY KEY,
            key VARCHAR (128),
            value VARCHAR (512)
        );`);
  } catch (e) {
    console.log(e);
  }
};

export const removeConfigTable = async () => {
  try {
    await dropTable(DB_NAME);
  } catch (e) {
    console.log(e);
  }
};

export const clearConfigTable = async () => {
  try {
    await truncateTable(DB_NAME);
  } catch (e) {
    console.log(e);
  }
};

export const getConfig = async () => {
  const pool = DB.getInstance();
  try {
    const query = PGformat(`SELECT * FROM %I`, DB_NAME);
    const res = await pool.query(query);

    return res.rows.reduce<Record<string, string[]>>((acc, row) => {
      if (!acc[row.key]) acc[row.key] = [];
      acc[row.key].push(row.value);
      return acc;
    }, {});
  } catch (e) {
    console.log(e);
  }
};

export const insertIntoConfigTable = async (rows: ConfigRow[]) => {
  const pool = DB.getInstance();
  if (!rows.length) return;
  const headers: string[] = Object.keys(rows[0]);
  const values: unknown[] = [];

  for (const row of rows) {
    values.push(Object.values(row));
  }
  try {
    const query = PGformat(
      `INSERT INTO %I (${headers.join(", ")}) VALUES %L`,
      DB_NAME,
      values,
    );
    await pool.query(query);
  } catch (e) {
    console.log(e);
  }
};
