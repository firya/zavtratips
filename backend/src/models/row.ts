import { model, Schema } from "mongoose";

const RowSchema = new Schema({
	sheetTitle: { type: String, required: true },
	rowNumber: { type: Number, required: true },
	data: { type: Schema.Types.Mixed },
});

RowSchema.virtual("dataArray").get(function () {
	const result = [];
	Object.keys(this.data).forEach((key, i) => {
		result.push(this.data[key]);
	});
	return result;
});

export default model("RowModel", RowSchema);
