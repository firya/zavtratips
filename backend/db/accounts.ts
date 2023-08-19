import pg from "pg";
import {
  dropTable,
  getAllTable,
  insertIntoTable,
  truncateTable,
} from "./common";
import { DB } from "./index";
import PGformat from "pg-format";

export type AccountRow = {
  telegram_id: string;
  role: "admin" | "moderator";
};

const DB_NAME = "zt_accounts";

export const createAccountsTable = async () => {
  const pool = DB.getInstance();
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

export const removeAccountsTable = async () => {
  try {
    await dropTable(DB_NAME);
  } catch (e) {
    console.log(e);
  }
};

export const clearAccountsTable = async () => {
  try {
    await truncateTable(DB_NAME);
  } catch (e) {
    console.log(e);
  }
};

export const getAccountList = async (): Promise<AccountRow[] | undefined> => {
  try {
    return await getAllTable(DB_NAME, "telegram_id", "ASC");
  } catch (e) {
    console.log(e);
  }
};

export const getAccountById = async (
  telegram_id: string,
): Promise<AccountRow | undefined> => {
  const pool = DB.getInstance();
  try {
    const query = PGformat(
      `SELECT * FROM %I WHERE telegram_id=%L`,
      DB_NAME,
      telegram_id,
    );
    const res = await pool.query(query);

    return res.rows.length === 1 ? res.rows[0] : undefined;
  } catch (e) {
    console.log(e);
  }
};

export const removeAccountById = async (telegram_id: string) => {
  const pool = DB.getInstance();
  try {
    const query = PGformat(
      `DELETE FROM %I WHERE telegram_id=%L`,
      DB_NAME,
      telegram_id,
    );
    return await pool.query(query);
  } catch (e) {
    console.log(e);
  }
};

export const insertIntoAccountsTable = async (
  pool: pg.Pool,
  rows: AccountRow[],
) => {
  return insertIntoTable(DB_NAME, rows);
};
