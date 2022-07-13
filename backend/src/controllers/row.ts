import { SortOrder } from "mongoose";
import RowModel from "../models/row";

import * as spreadsheet from "../libs/googlespreadsheet";

export const listAllRows = async (req, res) => {
	const limit: number = req.query.limit || 20;
	const sortQuery: string = req.query.sort || "rowNumber";
	const orderQuery: SortOrder = (req.query.order as SortOrder) || "asc";

	let findQuery = req.query.sheetTitle
		? { sheetTitle: req.query.sheetTitle }
		: {};

	if (req.query.data) {
		Object.keys(req.query.data).forEach((key) => {
			findQuery[`data.${key}`] = req.query.data[key];
		});
	}

	try {
		const rows = await RowModel.find(findQuery)
			.limit(limit)
			.sort({ [sortQuery]: orderQuery });
		res.json(rows);
	} catch (e) {
		console.log(e);
		res.json({ error: e });
	}
};

export const createRow = async (req, res) => {
	try {
		const addRowResult = await spreadsheet.addRow(
			process.env.GOOGLE_SPREADSHEET_URL,
			req.body.sheetTitle,
			req.body.data
		);

		req.body.rowNumber = addRowResult.rowNumber;
		req.body.data = addRowResult.data;

		var row = new RowModel(req.body);
		const rows = await RowModel.create(row);

		res.json(rows);
	} catch (e) {
		console.log(e);
		res.json({ error: e });
	}
};

export const updateRow = async (req, res) => {
	try {
		const updateRowResult = await spreadsheet.updateRow(
			process.env.GOOGLE_SPREADSHEET_URL,
			req.body.sheetTitle,
			req.body.rowNumber,
			req.body.data
		);

		const row = await RowModel.findOneAndUpdate(
			{ rowNumber: req.body.rowNumber },
			{ data: updateRowResult }
		);

		res.json(row);
	} catch (e) {
		console.log(e);
		res.json({ error: e });
	}
};
