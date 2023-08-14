import pg from "pg";
import { insertIntoTable } from "./common";

export type AccountRow = {
  telegram_id: string;
  role: "admin" | "moderator";
};

const DB_NAME = "zt_accounts";

export const createAccountsTable = async (pool: pg.Pool) => {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS ${DB_NAME} (
            telegram_id serial PRIMARY KEY,
            role VARCHAR (50) DEFAULT 'moderator'
        );`);

    if (!process.env.TELEGRAM_DEFAULT_ADMIN) return;

    const adminAccount = await pool.query(
      `SELECT * FROM ${DB_NAME} WHERE telegram_id='${process.env.TELEGRAM_DEFAULT_ADMIN}'`,
    );
    if (adminAccount.rows.length === 0) {
      await insertIntoAccountsTable(pool, [
        { telegram_id: process.env.TELEGRAM_DEFAULT_ADMIN, role: "admin" },
      ]);
    }
  } catch (e) {
    console.log(e);
  }
};

export const removeAccountsTable = async (pool: pg.Pool) => {
  try {
    await pool.query(`DROP TABLE IF EXISTS ${DB_NAME}`);
  } catch (e) {
    console.log(e);
  }
};

export const clearAccountsTable = async (pool: pg.Pool) => {
  try {
    await pool.query(`TRUNCATE TABLE ${DB_NAME}`);
  } catch (e) {
    console.log(e);
  }
};

export const getAccountList = async (pool: pg.Pool) => {
  return await pool.query(`SELECT * FROM ${DB_NAME}`);
};

export const insertIntoAccountsTable = async (
  pool: pg.Pool,
  rows: AccountRow[],
) => {
  return insertIntoTable(pool, DB_NAME, rows);
};
