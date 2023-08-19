import { getAllExcelRecommendations } from "../db/excel";
import {
  clearRecommendationsTable,
  insertIntoRecommendationsTable,
  DB_NAME,
} from "../db/recommendation";

export const updateRecommendations = async () => {
  const values = await getAllExcelRecommendations();
  if (!values) return;

  await clearRecommendationsTable();
  await insertIntoRecommendationsTable(values);

  console.log(`${DB_NAME} table updated`);
};
