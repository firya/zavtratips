import { Composer } from "telegraf";

import ConfigModel from "../models/config";
import RowModel from "../models/row";
import { splitName } from "../libs/utils";

export default Composer.on("inline_query", async (ctx) => {
	const config = await ConfigModel.findOne({
		sheetUrl: process.env.GOOGLE_SPREADSHEET_URL,
	});

	const records = await RowModel.find({
		[`data.${config.findBy.columnName}`]: {
			$regex: ctx.inlineQuery.query,
			$options: "i",
		},
		sheetTitle: config.findBy.sheetTitle,
	});

	const sheetConfig = config.sheetList.find(
		(sheet) => sheet.title === config.findBy.sheetTitle
	);

	const results = [];

	for (const record of records) {
		const recomendations = getRecommendations(record, sheetConfig);

		const splittedName = splitName(record.data["Название"]);

		if (!results.some((result) => result.title === splittedName.name)) {
			results.push({
				title: splittedName.name,
				description: record.data["Тип"],
				url: record.data["Ссылка"],
				platforms: record.data["Платформы"],
				rating: record.data["Рейтинг"],
				genre: record.data["Жанр"],
				release: record.data["Дата релиза"],
				length: record.data["Продолжительность"],
				recommendations: recomendations ? [recomendations] : [],
			});
		} else {
			const resultIndex = results.findIndex(
				(result) => result.title === splittedName.name
			);

			if (recomendations && resultIndex !== -1) {
				results[resultIndex].recommendations.push(recomendations);
			}
		}
	}

	return await ctx.answerInlineQuery(
		results.slice(0, 50).map((record, i) => ({
			id: i.toString(),
			type: "article",
			thumb_url: record.image,
			title: record.title,
			description: record.description,
			input_message_content: {
				message_text: generateMessage(record),
				parse_mode: "Markdown",
			},
		}))
	);
});

const generateMessage = (row): string => {
	let message = `*${row.title}*\n`;

	if (row.url !== "") {
		const parsedUrl = new URL(row.url);
		message += `\n[${parsedUrl.hostname}](${row.url})`;
	}
	if (row.platforms !== "") {
		message += `\nПлатформы: ${row.platforms}`;
	}
	if (row.rating !== "") {
		message += `\nРейтинг: ${row.rating}`;
	}
	if (row.genre !== "") {
		message += `\nЖанр: ${row.genre}`;
	}
	if (row.release !== "") {
		message += `\nДата релиза: ${row.release}`;
	}
	if (row.length !== "") {
		message += `\nПродолжительность: ${row.length}`;
	}
	message +=
		"\n" +
		row.recommendations
			.map((rec) => {
				return `\n*${rec.title}*:\n${rec.who
					.map((who) => {
						return `${who.name}: ${who.value}`;
					})
					.join("\n")}`;
			})
			.join("\n");

	return message;
};

const getRecommendations = (row, sheetConfig) => {
	return {
		title: sheetConfig.recommendationColumns.meta
			.map((column) => row.data[column])
			.join(" — ")
			.trim(),
		who: sheetConfig.recommendationColumns.who
			.map((column) =>
				row.data[column] != ""
					? {
							name: column,
							value: row.data[column],
					  }
					: false
			)
			.filter((item) => item),
	};
};
