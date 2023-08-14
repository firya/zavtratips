import { DB } from "../db";
import { clearConfigTable, insertIntoConfigTable } from "../db/config";
import { getExcelConfig } from "../db/excel";

export const updateConfig = async () => {
  if (!process.env.GOOGLE_SPREADSHEET_URL)
    return console.log("there is no GOOGLE_SPREADSHEET_URL");

  const pool = DB.getInstance();
  const values = await getExcelConfig();
  if (!values) return;

  await clearConfigTable(pool);
  await insertIntoConfigTable(pool, values);

  console.log("zt_config table updated");
};
