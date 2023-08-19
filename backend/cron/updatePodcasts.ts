import { getAllExcelPodcasts } from "../db/excel";
import {
  clearPodcastsTable,
  insertIntoPodcastsTable,
  DB_NAME,
} from "../db/podcasts";

export const updatePodcasts = async () => {
  const values = await getAllExcelPodcasts();
  if (!values) return;

  await clearPodcastsTable();
  await insertIntoPodcastsTable(values);

  console.log(`${DB_NAME} table updated`);
};
