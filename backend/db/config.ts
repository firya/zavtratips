import pg from "pg";
import PGformat from "pg-format";

export type ConfigRow = {
  id?: number;
  key: string;
  value: string;
};

const DB_NAME = "zt_config";

export const createConfigTable = async (pool: pg.Pool) => {
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

export const removeConfigTable = async (pool: pg.Pool) => {
  try {
    await pool.query(`DROP TABLE IF EXISTS ${DB_NAME}`);
  } catch (e) {
    console.log(e);
  }
};

export const clearConfigTable = async (pool: pg.Pool) => {
  try {
    await pool.query(`TRUNCATE TABLE ${DB_NAME}`);
  } catch (e) {
    console.log(e);
  }
};

export const insertIntoConfigTable = async (
  pool: pg.Pool,
  rows: ConfigRow[],
) => {
  if (!rows.length) return;
  const headers: string[] = Object.keys(rows[0]);
  const values: unknown[] = [];

  for (const row of rows) {
    values.push(Object.values(row));
  }
  try {
    const query = PGformat(
      `INSERT INTO ${DB_NAME} (${headers.join(", ")}) VALUES %L`,
      values,
    );
    await pool.query(query);
  } catch (e) {
    console.log(e);
  }
};
