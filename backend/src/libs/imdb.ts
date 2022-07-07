import Additional from "../models/additional";
import fetch from "node-fetch";

export const getIdfromUrl = (url: string) => {
	if (url === "") return "";
	const matches = url.match(/tt\d+/g);
	const result = matches ? matches[0] : "";
	return result;
};
export const clearIMDBurl = (url: string): string => {
	return `https://imdb.com/title/${getIdfromUrl(url)}`;
};
export const getIMDB = async (url: string) => {
	const id: string = getIdfromUrl(url);
	url = clearIMDBurl(url);

	const dataExists = await Additional.findOne({ url });

	if (dataExists) {
		return dataExists;
	}

	try {
		let response = await fetch(
			`http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&i=${id}`
		);
		let json = await response.json();

		if (json.Error) {
			return false;
		}

		const result = { url, data: json };

		Additional.create(result);

		return result;
	} catch (e) {
		return false;
	}
};
export const searchIMDB = async (query: string) => {
	try {
		let response = await fetch(
			`http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&s=${query}`
		);
		let json = await response.json();

		return json.Search.map((item) => ({
			title: item.Title,
			year: item.Year,
			link: `https://www.imdb.com/title/${item.imdbID}`,
		}));
	} catch (e) {
		return false;
	}
};
