import { getRowList } from "../../libs/googlespreadsheet";
import { ConfigRow } from "../config";

const SHEET_NAME = "Config";

export const getExcelConfig = async () => {
  const res = await getRowList(SHEET_NAME);

  if (!res) return;

  const values: ConfigRow[] = [];
  res.map((row) => {
    Object.keys(row).map((key) => {
      if (row[key]) values.push({ key, value: row[key] });
    });
  });

  return values;
};
