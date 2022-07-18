import { GoogleSpreadsheet } from "google-spreadsheet";
import ConfigModel from "../models/config";
import { prepareAdditionalToInsert, getAdditional } from "./additionals";

export const getDoc = async (url: string) => {
  const id = new URL(url).pathname.split("/")[3];

  const doc = new GoogleSpreadsheet(id);

  try {
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY,
    });

    await doc.loadInfo();

    return doc;
  } catch (e) {
    throw e.message;
  }
};

export const getSheetList = async (url: string) => {
  try {
    const doc = await getDoc(url);

    return doc.sheetsByIndex.map((sheet) => sheet.title);
  } catch (e) {
    return { error: e };
  }
};

export const getColumnList = async (
  url: string,
  sheetTitle: string,
  headerRowIndex: number = 1
) => {
  try {
    const doc = await getDoc(url);

    await doc.sheetsByTitle[sheetTitle].loadHeaderRow(headerRowIndex);

    return doc.sheetsByTitle[sheetTitle].headerValues;
  } catch (e) {
    return { error: e };
  }
};

export const getRowList = async (
  url: string,
  sheetTitle: string,
  headerRowIndex: number = 1
) => {
  try {
    const doc = await getDoc(url);

    const sheetData = doc.sheetsByTitle[sheetTitle];

    const rows = await sheetData.getRows({
      offset: headerRowIndex >= 2 ? headerRowIndex - 2 : 0, // minus one for header row and minus one for count from zero
      limit: sheetData.rowCount,
    });

    const headers = sheetData.headerValues;

    let result = [];

    for (let row of rows) {
      result.push(rowToObject(row, headers));
    }

    return result;
  } catch (e) {
    console.log(e);
    return [];
  }
};

export const addRows = async (url: string, sheetTitle: string, data: {}[]) => {
  try {
    const doc = await getDoc(url);

    const config = await ConfigModel.findOne({ sheetUrl: url });
    const sheetConfig = config.sheetList.find(
      (sheet) => sheet.title === sheetTitle
    );

    const sheet = doc.sheetsByTitle[sheetTitle];
    await sheet.loadHeaderRow();
    const headers = sheet.headerValues;

    let rows = data.map((row) => ({ ...createEmptyRow(headers), ...row }));

    const result = await sheet.addRows(rows);

    return { data: rowToObject(result, headers) };
  } catch (e) {
    throw new Error(e);
  }
};

export const addRow = async (url: string, sheetTitle: string, data: {}) => {
  try {
    const doc = await getDoc(url);

    const config = await ConfigModel.findOne({ sheetUrl: url });
    const sheetConfig = config.sheetList.find(
      (sheet) => sheet.title === sheetTitle
    );

    const sheet = doc.sheetsByTitle[sheetTitle];
    await sheet.loadHeaderRow();
    const headers = sheet.headerValues;

    let additional = {};
    if (sheetConfig.additional) {
      additional = prepareAdditionalToInsert(
        await getAdditional(data[sheetConfig.additional])
      );
    }

    let row = { ...createEmptyRow(headers), ...data, ...additional };

    const result = await sheet.addRow(row);

    return { rowNumber: result.rowNumber, data: rowToObject(result, headers) };
  } catch (e) {
    throw new Error(e);
  }
};

export const updateAllRows = async (
  url: string,
  sheetTitle: string,
  from: number = null,
  to: number = null
) => {
  try {
    const doc = await getDoc(url);

    const config = await ConfigModel.findOne({ sheetUrl: url });
    const sheetConfig = config.sheetList.find(
      (sheet) => sheet.title === sheetTitle
    );

    const sheet = doc.sheetsByTitle[sheetTitle];
    let rows = await sheet.getRows();

    if (from || to) {
      from = from ? from - 2 : 0;
      to = to ? to - 1 : rows.length - 1;

      rows = rows.slice(from, to);
    }

    const headers = sheet.headerValues;

    for await (const row of rows) {
      let resultRow = rowToObject(row, headers);

      let additional = {};

      if (sheetConfig.additional) {
        additional = prepareAdditionalToInsert(
          await getAdditional(resultRow[sheetConfig.additional])
        );
      }

      resultRow = {
        ...resultRow,
        ...additional,
      };

      const updatedRow = fillRow(row, resultRow, sheetConfig.uneditableColumns);

      await updatedRow.save();

      console.log(`row ${row.rowNumber} updated`);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // avoid google api limit
    }

    return true;
  } catch (e) {
    throw new Error(e);
  }
};

export const updateRow = async (
  url: string,
  sheetTitle: string,
  rowNumber: number,
  data: {} = {}
) => {
  try {
    const doc = await getDoc(url);

    const config = await ConfigModel.findOne({ sheetUrl: url });
    const sheetConfig = config.sheetList.find(
      (sheet) => sheet.title === sheetTitle
    );

    const sheet = doc.sheetsByTitle[sheetTitle];
    const rows = await sheet.getRows();

    const headers = sheet.headerValues;

    let row = {
      ...rowToObject(rows[rowNumber - 2], headers),
      ...data,
    };

    let additional = {};
    if (sheetConfig.additional) {
      additional = prepareAdditionalToInsert(
        await getAdditional(row[sheetConfig.additional])
      );
    }

    row = {
      ...row,
      ...additional,
    };

    const updatedRow = fillRow(
      rows[rowNumber - 2],
      row,
      sheetConfig.uneditableColumns
    );

    await updatedRow.save();

    return { rowNumber: rowNumber, data: rowToObject(updatedRow, headers) };
  } catch (e) {
    throw new Error(e);
  }
};

export const deleteRow = async (
  url: string,
  sheetTitle: string,
  rowNumber: number
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
    throw new Error(e);
  }
};

const createEmptyRow = (headers: string[]) => {
  let result: {} = {};
  headers.forEach((header) => {
    result[header] = "";
  });
  return result;
};

const fillRow = (row, data, uneditableColumns: string[] = []) => {
  if (!row) return null;
  Object.keys(data).forEach((header) => {
    row[header] = uneditableColumns.includes(header) ? "" : data[header];
  });

  return row;
};

const rowToObject = (row, headers: string[]) => {
  const object: {} = {};

  headers.forEach((header) => {
    object[header] = row[header];
  });

  return object;
};
