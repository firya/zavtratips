import { DB } from "../db";
import {
  clearStreamsTable,
  DB_NAME,
  insertIntoStreamsTable,
} from "../db/streams";
import { getAllExcelStreams } from "../db/excel";

export const updateStreams = async () => {
  const pool = DB.getInstance();

  const values = await getAllExcelStreams();
  if (!values) return;

  await clearStreamsTable(pool);
  await insertIntoStreamsTable(pool, values);

  console.log(`${DB_NAME} table updated`);
};
