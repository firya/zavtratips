import { clearConfigTable, insertIntoConfigTable } from "../db/config";
import { getExcelConfig } from "../db/excel";

export const updateConfig = async () => {
  if (!process.env.GOOGLE_SPREADSHEET_URL)
    return console.log("there is no GOOGLE_SPREADSHEET_URL");

  const values = await getExcelConfig();
  if (!values) return;

  await clearConfigTable();
  await insertIntoConfigTable(values);

  console.log("zt_config table updated");
};
