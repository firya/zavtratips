import { getRowList } from "../../libs/googlespreadsheet";
import { ConfigRow } from "../config";

const SHEET_NAME = "Config";

export const getExcelConfig = async () => {
  if (!process.env.GOOGLE_SPREADSHEET_URL)
    return console.log("there is no GOOGLE_SPREADSHEET_URL");

  const res = await getRowList(process.env.GOOGLE_SPREADSHEET_URL, SHEET_NAME);

  const values: ConfigRow[] = [];
  res.map((row) => {
    Object.keys(row).map((key) => {
      if (row[key]) values.push({ key, value: row[key] });
    });
  });

  return values;
};
