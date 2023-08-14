import { getAllExcelPodcasts } from "../db/excel";
import { DB } from "../db";
import {
  clearPodcastsTable,
  insertIntoPodcastsTable,
  DB_NAME,
} from "../db/podcasts";

export const updatePodcasts = async () => {
  const pool = DB.getInstance();

  const values = await getAllExcelPodcasts();
  if (!values) return;

  await clearPodcastsTable(pool);
  await insertIntoPodcastsTable(pool, values);

  console.log(`${DB_NAME} table updated`);
};
