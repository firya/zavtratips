import { model, Schema } from "mongoose";

const AdditionalSchema = new Schema({
	url: { type: String, required: true },
	data: {},
});

export default model("AdditionalModel", AdditionalSchema);
