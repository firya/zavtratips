import { GoogleSpreadsheet, GoogleSpreadsheetRow } from "google-spreadsheet";
import { JWT } from "google-auth-library";

export const getDoc = async (url: string) => {
  const id = new URL(url).pathname.split("/")[3];

  const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const doc = new GoogleSpreadsheet(id, serviceAccountAuth);

  await doc.loadInfo();

  return doc;
};

export const getRowList = async (
  url: string,
  sheetTitle: string,
  headerRowIndex: number = 1,
) => {
  try {
    const doc = await getDoc(url);

    const sheetData = doc.sheetsByTitle[sheetTitle];

    const rows = await sheetData.getRows({
      offset: headerRowIndex >= 2 ? headerRowIndex - 2 : 0, // minus one for header row and minus one for count from zero
      limit: sheetData.rowCount,
    });

    const headers = sheetData.headerValues;

    const result = [];

    for (const row of rows) {
      result.push(rowToObject(row, headers));
    }

    return result;
  } catch (e) {
    console.log(e);
    return [];
  }
};

export const addRows = async (
  url: string,
  sheetTitle: string,
  data: Record<string, string>[],
) => {
  try {
    const doc = await getDoc(url);

    const sheetData = doc.sheetsByTitle[sheetTitle];
    await sheetData.loadHeaderRow();
    const headers = sheetData.headerValues;

    const rows = data.map((row) => ({ ...createEmptyRow(headers), ...row }));

    return await sheetData.addRows(rows);
  } catch (e) {
    console.log(e);
  }
};

export const clearRow = async (
  url: string,
  sheetTitle: string,
  rowNumber: number,
) => {
  try {
    const doc = await getDoc(url);

    const sheet = doc.sheetsByTitle[sheetTitle];
    const rows = await sheet.getRows();

    const headers = sheet.headerValues;

    const deletedRow = fillRow(rows[rowNumber - 2], createEmptyRow(headers));

    if (deletedRow) {
      await deletedRow.save();
    }

    return { rowNumber: rowNumber };
  } catch (e) {
    console.log(e);
  }
};

const createEmptyRow = (headers: string[]) => {
  const result: Record<string, string> = {};
  headers.forEach((header) => {
    result[header] = "";
  });
  return result;
};

const fillRow = (row: GoogleSpreadsheetRow, data: Record<string, string>) => {
  if (!row) return null;
  Object.keys(data).forEach((header) => {
    row.set(header, data[header]);
  });

  return row;
};

const rowToObject = (row: GoogleSpreadsheetRow, headers: string[]) => {
  const object: Record<string, string> = {};

  headers.forEach((header) => {
    object[header] = row.get(header);
  });

  return object;
};
