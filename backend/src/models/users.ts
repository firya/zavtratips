import { model, Schema } from "mongoose";

const UserSchema = new Schema({
	id: { type: Number, required: true },
	status: {
		type: String,
		enum: ["admin", "moderator"],
		default: "moderator",
	},
});

export default model("UserModel", UserSchema);
