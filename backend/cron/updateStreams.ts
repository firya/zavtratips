import {
  clearStreamsTable,
  DB_NAME,
  insertIntoStreamsTable,
} from "../db/streams";
import { getAllExcelStreams } from "../db/excel";

export const updateStreams = async () => {
  const values = await getAllExcelStreams();
  if (!values) return;

  await clearStreamsTable();
  await insertIntoStreamsTable(values);

  console.log(`${DB_NAME} table updated`);
};
