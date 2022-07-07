import { Composer } from "telegraf";
import UserModel from "../../models/users";
import ConfigModel from "../../models/config";
import setupWebApp from "../webapp";
import { updateSheets } from "../../cron/spreadsheet";

export default {
	help: "/init — Start bot initialization",
	run: Composer.command("/init", async (ctx) => {
		const adminId = process.env.TELEGRAM_DEFAULT_ADMIN;

		if (!adminId) {
			ctx.reply("default admin id not set in .env file");
		}

		await UserModel.deleteMany({});
		await ConfigModel.deleteMany({});

		await UserModel.create({
			id: adminId,
			status: "admin",
		});

		await ConfigModel.create({
			sheetUrl: process.env.GOOGLE_SPREADSHEET_URL,
			findBy: {
				sheetTitle: "Рекомендации",
				columnName: "Название",
			},
			sheetList: [
				{
					title: "Рекомендации",
					additional: "Ссылка",
					startRow: 2,
					headers: [
						"Дата",
						"Выпуск",
						"Тип",
						"Название",
						"Ссылка",
						"Изображение",
						"Описание",
						"Платформы",
						"Рейтинг",
						"Жанр",
						"Дата релиза",
						"Продолжительность",
						"Дима",
						"Тимур",
						"Максим",
						"Гость",
					],
					uneditableColumns: ["Дата", "Описание"],
					recommendationColumns: {
						meta: ["Дата", "Выпуск"],
						who: ["Дима", "Тимур", "Максим", "Гость"],
					},
				},
				{
					title: "Выпуски",
					startRow: 3,
					headers: [
						"Дата",
						"Шоу",
						"Выпуск, №",
						"Шоу и номер",
						"Название",
						"Полное название",
						"Продолжительность",
					],
					uneditableColumns: ["Шоу и номер", "Полное название"],
				},
			],
		});

		await updateSheets();

		setupWebApp();

		ctx.reply("👍");
	}),
};
