import Users from "../models/users";
import { WebAppUrl } from "../dev";
import Bot from "./index";

export default async (userList: number[] = [], status: boolean = true) => {
	userList =
		userList.length > 0
			? userList
			: (await Users.find()).map((user) => user.id);

	if (userList.length > 0) {
		userList.forEach(async (user) => {
			try {
				await Bot.telegram.setChatMenuButton({
					chatId: user,
					menuButton: status
						? {
								type: "web_app",
								text: "Add",
								web_app: {
									url: WebAppUrl,
								},
						  }
						: { type: "default" },
				});
			} catch (e) {
				console.log(e);
			}
		});
	}
};
