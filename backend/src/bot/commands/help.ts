import { Composer } from "telegraf";
import {
	adduser,
	removeuser,
	userlist,
	init,
	myid,
	forceload,
	updaterows,
} from "./index";

export default Composer.command("/help", async (ctx) => {
	const help: string =
		init.help +
		"\n" +
		myid.help +
		"\n" +
		adduser.help +
		"\n" +
		removeuser.help +
		"\n" +
		userlist.help +
		"\n" +
		forceload.help +
		"\n" +
		updaterows.help;
	ctx.reply(help);
});
