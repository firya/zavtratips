import { model, Schema } from "mongoose";

const SheetSchema: Schema = new Schema({
	title: { type: String, required: true },
	additional: { type: String },
	startRow: { type: Number },
	headers: [{ type: String }],
	uneditableColumns: [{ type: String }],
	recommendationColumns: {
		type: {
			meta: [{ type: String }],
			who: [{ type: String }],
		},
	},
});

const ConfigSchema: Schema = new Schema({
	sheetUrl: { type: String, required: true },
	sheetList: [{ type: SheetSchema }],
	findBy: {
		type: {
			sheetTitle: String,
			columnName: String,
		},
	},
});

export default model("ConfigModel", ConfigSchema);
