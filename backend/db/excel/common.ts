import {
  addRows,
  getRowList,
  removeRow,
  updateRow,
} from "../../libs/googlespreadsheet";
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
  const res = await getRowList(sheetName, startRow);

  const values: T[] = [];

  res.map((row, rowNumber) => {
    const value = typedObjectKeys(columnMap).reduce<T>((acc, key) => {
      if (!key) return acc;
      const mapElement = columnMap[key];
      if (!mapElement) return acc;

      const result = row[mapElement.label];

      // @ts-expect-error wtf?
      acc[key] = mapElement.transform ? mapElement.transform(result) : result;

      return acc;
    }, {} as T);

    value["row"] = rowNumber + startRow;

    values.push(value);
  });

  return values;
};

export const addExcelRow = async <
  T extends Record<string, unknown>,
  U extends ColumnMapType,
>(
  sheetName: string,
  rowData: T,
  columnMap: U,
) => {
  const res = typedObjectKeys(rowData).reduce<Record<string, string>>(
    (acc, key) => {
      const mapElement = columnMap[key as string];
      if (!mapElement) return acc;

      const result = rowData[key];

      // @ts-expect-error wtf?
      acc[mapElement.label] =
        mapElement.transformExcel && result
          ? mapElement.transformExcel(result as string)
          : result;

      return acc;
    },
    {},
  );
  return await addRows(sheetName, [res]);
};

export const updateExcelRow = async <
  T extends Record<string, unknown>,
  U extends ColumnMapType,
>(
  sheetName: string,
  rowNumber: number,
  rowData: T,
  columnMap: U,
) => {
  const res = typedObjectKeys(rowData).reduce<Record<string, string>>(
    (acc, key) => {
      const mapElement = columnMap[key as string];
      if (!mapElement) return acc;

      const result = rowData[key];

      // @ts-expect-error wtf?
      acc[mapElement.label] =
        mapElement.transformExcel && result
          ? mapElement.transformExcel(result as string)
          : result;

      return acc;
    },
    {},
  );

  return await updateRow(sheetName, rowNumber, res);
};

export const removeExcelRow = async (sheetName: string, rowNumber: number) => {
  return await removeRow(sheetName, rowNumber);
};
