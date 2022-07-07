import { getDoc } from "../libs/googlespreadsheet";
import { GoogleSpreadsheetRow } from "google-spreadsheet";
import RowModel from "../models/row";
import ConfigModel from "../models/config";
import { getAdditional } from "../libs/additionals";

export const updateSheets = async () => {
	const config = await ConfigModel.findOne({
		sheetUrl: process.env.GOOGLE_SPREADSHEET_URL,
	});
	if (!config) {
		return "Cannot download spreadsheet, empty url";
	}

	const url: string = config.sheetUrl;
	const sheetList: any = config.sheetList;

	for await (const sheet of sheetList) {
		await getRows(url, sheet.title, sheet.startRow || 2, sheet.additional);
	}
};

export const getRows = async (
	url: string,
	sheetTitle: string,
	startRow: number = 2,
	additional: string | null = null
) => {
	const doc = await getDoc(url);
	const sheetData = doc.sheetsByTitle[sheetTitle];

	if (!sheetData) {
		return `Cannot find sheet by title: ${sheetTitle}`;
	}

	const rows = await sheetData.getRows({
		offset: startRow >= 2 ? startRow - 2 : 0, // minus one for header row and minus one for count from zero
		limit: sheetData.rowCount,
	});
	const headers = sheetData.headerValues;

	let result = [];

	for await (let row of rows) {
		if (additional) {
			await getAdditional(row["Ссылка"]);
		}
		result.push(await getRow(row, headers));
	}

	result = result.map((row, i) => ({
		sheetTitle: sheetTitle,
		rowNumber: startRow + i,
		data: row,
	}));

	await RowModel.deleteMany({ sheetTitle: sheetTitle });
	await RowModel.insertMany(result);
};

export const getRow = async (row: GoogleSpreadsheetRow, headers: string[]) => {
	let isEmpty: boolean = true;
	let resultRow: {} = {};

	for await (let header of headers) {
		if (header !== "") {
			if (row[header] && row[header] != " ") {
				isEmpty = false;
			}
			resultRow[header] = row[header] || "";
		}
	}

	if (!isEmpty) {
		return resultRow;
	} else {
		return false;
	}
};
