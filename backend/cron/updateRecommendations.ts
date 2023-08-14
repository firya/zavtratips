import { getAllExcelRecommendations } from "../db/excel";
import { DB } from "../db";
import {
  clearRecommendationsTable,
  insertIntoRecommendationsTable,
  DB_NAME,
} from "../db/recommendation";

export const updateRecommendations = async () => {
  const pool = DB.getInstance();

  const values = await getAllExcelRecommendations();
  if (!values) return;

  await clearRecommendationsTable(pool);
  await insertIntoRecommendationsTable(pool, values);

  console.log(`${DB_NAME} table updated`);
};
