import PGformat from "pg-format";
import { DB } from "./index";

export const defaultPageSize = 20;

export const insertIntoTable = async <T extends object[]>(
  tableName: string,
  rows: T,
) => {
  const pool = DB.getInstance();
  if (!rows.length) return;
  const headers: string[] = Object.keys(rows[0]);
  const values: unknown[] = [];

  for (const row of rows) {
    values.push(Object.values(row));
  }

  const query = PGformat(
    `INSERT INTO ${tableName} (${headers.join(", ")}) VALUES %L`,
    values,
  );
  return await pool.query(query);
};

export const updateInTable = async <T extends object>(
  tableName: string,
  data: T,
  conditions: Partial<Record<keyof T, unknown>>,
) => {
  const pool = DB.getInstance();

  const valuesQuery = Object.keys(data).map(() => `%I=%L`);
  const values: string[] = [];
  Object.entries(data).map(([key, value]) => {
    values.push(key);
    values.push(value);
  });

  const wheresQuery = Object.keys(conditions).map(() => `%I=%L`);
  const wheres: unknown[] = [];
  Object.entries(conditions).map(([key, value]) => {
    wheres.push(key);
    wheres.push(value);
  });

  const query = PGformat(
    `UPDATE %I SET ${valuesQuery.join(", ")} WHERE ${wheresQuery.join(
      " AND ",
    )}`,
    tableName,
    ...values,
    ...wheres,
  );

  return await pool.query(query);
};

export const deleteFromTable = async <T extends object>(
  tableName: string,
  conditions: Partial<Record<keyof T, unknown>>,
) => {
  const pool = DB.getInstance();

  const wheresQuery = Object.keys(conditions).map(() => `%I=%L`);
  const wheres: unknown[] = [];
  Object.entries(conditions).map(([key, value]) => {
    wheres.push(key);
    wheres.push(value);
  });

  const query = PGformat(
    `DELETE FROM %I WHERE ${wheresQuery.join(" AND ")}`,
    tableName,
    ...wheres,
  );

  return await pool.query(query);
};

export const dropTable = async (tableName: string) => {
  const pool = DB.getInstance();

  const query = PGformat(`DROP TABLE IF EXISTS %I`, tableName);

  return await pool.query(query);
};

export const truncateTable = async (tableName: string) => {
  const pool = DB.getInstance();

  const query = PGformat(`TRUNCATE TABLE %I`, tableName);

  return await pool.query(query);
};

export const getAllTable = async <T extends object>(
  tableName: string,
  sortBy: keyof T,
  sort: "DESC" | "ASC" = "DESC",
): Promise<T[]> => {
  const pool = DB.getInstance();

  const query = PGformat(
    `SELECT * FROM %I ORDER BY %I %s`,
    tableName,
    sortBy,
    sort,
  );

  const res = await pool.query(query);

  return res.rows;
};

export type FindInTableParams<T> = {
  tableName: string;
  queryParam: keyof T;
  queryString: string;
  sortBy: keyof T;
  sort?: "DESC" | "ASC";
  page?: number;
  limit?: number;
};

export const findInTable = async <T extends object>({
  tableName,
  queryParam,
  queryString,
  sortBy,
  sort = "DESC",
  page = 1,
  limit = defaultPageSize,
}: FindInTableParams<T>): Promise<T[]> => {
  const pool = DB.getInstance();

  const query = PGformat(
    `SELECT * FROM %I WHERE %I ILIKE '%' || %L || '%' ORDER BY %I %s LIMIT %L OFFSET %L`,
    tableName,
    queryParam,
    queryString,
    sortBy,
    sort,
    limit,
    (page - 1) * limit,
  );

  const res = await pool.query(query);

  return res.rows;
};

export const findInTableStrict = async <T extends object>({
  tableName,
  queryParam,
  queryString,
  sortBy,
  sort = "DESC",
  page = 1,
  limit = defaultPageSize,
}: FindInTableParams<T>): Promise<T[]> => {
  const pool = DB.getInstance();

  const query = PGformat(
    `SELECT * FROM %I WHERE %I=%L ORDER BY %I %s LIMIT %L OFFSET %L`,
    tableName,
    queryParam,
    queryString,
    sortBy,
    sort,
    limit,
    (page - 1) * limit,
  );
  const res = await pool.query(query);

  return res.rows;
};
