import { getRAWG } from "./rawg";
import { getIMDB } from "./imdb";

import { formatDate } from "./utils";

export const getAdditional = async (url: string) => {
	try {
		const parsedURL = new URL(url);

		let result = {};

		if (parsedURL.host.includes("rawg.io")) {
			result = await getRAWG(url);
		} else if (parsedURL.host.includes("imdb.com")) {
			result = await getIMDB(url);
		}

		return result;
	} catch (e) {
		return false;
	}
};

export const prepareAdditionalToInsert = (additional: any) => {
	let result = {
		Изображение:
			"https://lh3.googleusercontent.com/proxy/9x18kFTI33ntQXwjFLGyaoXRVr13wziRUrSFUNlvjJ6EF5jN8QlGSXFDJClMsZ3QzepLH9Ti_XXlegFGbfW7zxWpNiN9R1hL6iHktnIBq1rS3DI64wQTx-Pfgct5Jzy7id887McTNABuP82DAWec",
		Платформы: "",
		Жанр: "",
		"Дата релиза": "",
		Рейтинг: "",
		Продолжительность: "",
	};
	if (!additional?.url) {
		return result;
	}
	if (additional.url.includes("rawg.io")) {
		const date: string = additional.data.released
			? formatDate(new Date(additional.data.released))
			: "";

		result = {
			Изображение: additional.data.background_image,
			Платформы: additional.data.platforms
				? additional.data.platforms
						.map((platform) => platform.platform.name)
						.join(", ")
				: "",
			Жанр: additional.data.genres
				? additional.data.genres.map((genre) => genre.name).join(", ")
				: "",
			Рейтинг: additional.data.metacritic || "",
			"Дата релиза": date,
			Продолжительность:
				additional.data.gameplayMain ||
				additional.data.gameplayMainExtra ||
				additional.data.gameplayCompletionist
					? `${[
							additional.data.gameplayMain,
							additional.data.gameplayMainExtra,
							additional.data.gameplayCompletionist,
					  ]
							.filter((item) => item)
							.join(" / ")} часов`
					: "",
		};
	} else if (additional.url.includes("imdb.com")) {
		const date: string = additional.data.Released
			? formatDate(new Date(additional.data.Released))
			: "";

		result = {
			Изображение:
				additional.data.Poster && additional.data.Poster !== "N/A"
					? additional.data.Poster
					: "https://lh3.googleusercontent.com/proxy/9x18kFTI33ntQXwjFLGyaoXRVr13wziRUrSFUNlvjJ6EF5jN8QlGSXFDJClMsZ3QzepLH9Ti_XXlegFGbfW7zxWpNiN9R1hL6iHktnIBq1rS3DI64wQTx-Pfgct5Jzy7id887McTNABuP82DAWec",
			Платформы: "",
			Жанр: additional.data.Genre || "",
			Рейтинг: additional.data.imdbRating || "",
			"Дата релиза": date,
			Продолжительность:
				additional.data.Runtime && additional.data.Runtime !== "N/A"
					? additional.data.Runtime.replace("min", "мин")
					: "",
		};
	}

	return result;
};
