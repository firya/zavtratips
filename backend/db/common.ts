import pg from "pg";
import PGformat from "pg-format";

export const insertIntoTable = async <T extends object[]>(
  pool: pg.Pool,
  tableName: string,
  rows: T,
) => {
  if (!rows.length) return;
  const headers: string[] = Object.keys(rows[0]);
  const values: unknown[] = [];

  for (const row of rows) {
    values.push(Object.values(row));
  }

  try {
    const query = PGformat(
      `INSERT INTO ${tableName} (${headers.join(", ")}) VALUES %L`,
      values,
    );
    await pool.query(query);
  } catch (e) {
    console.log(e);
  }
};
