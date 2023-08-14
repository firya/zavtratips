import { getRowList } from "../../libs/googlespreadsheet";
import { typedObjectKeys } from "../../utils";
import { ColumnMapType } from "./index.types";

export const getAllExcelRows = async <
  T extends object & { row?: number },
  U extends ColumnMapType,
>(
  sheetName: string,
  startRow: number,
  columnMap: U,
): Promise<T[] | void> => {
  if (!process.env.GOOGLE_SPREADSHEET_URL)
    return console.log("there is no GOOGLE_SPREADSHEET_URL");

  const res = await getRowList(
    process.env.GOOGLE_SPREADSHEET_URL,
    sheetName,
    startRow,
  );

  const values: T[] = [];

  res.map((row, rowNumber) => {
    const value = typedObjectKeys(columnMap).reduce<T>((acc, key) => {
      if (!key) return acc;
      const mapElement = columnMap[key];
      if (!mapElement) return acc;

      const result = row[mapElement.label];
      // @ts-expect-error wtf?
      acc[key] = mapElement.transform ? mapElement.transform?.(result) : result;

      return acc;
    }, {} as T);

    value["row"] = rowNumber + startRow;

    values.push(value);
  });

  return values;
};
