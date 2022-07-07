import { searchIMDB } from "../libs/imdb";
import { searchRAWG } from "../libs/rawg";

export const getSuggestions = async (req, res) => {
	const provider: string = req.query.provider;
	const value: string = req.query.value;

	let result = [];
	if (provider === "imdb") {
		result = await searchIMDB(value);
	} else if (provider === "rawg") {
		result = await searchRAWG(value);
	}

	res.json(result);
};
