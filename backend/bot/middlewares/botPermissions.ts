// import Users from "../../models/users";
//
// export default () => async (ctx, next) => {
// 	const publicCommands: string[] = ["myid", "init"];
//
// 	if (ctx.channelPost || ctx.message) {
// 		if (ctx.state?.command) {
// 			if (!publicCommands.includes(ctx.state.command.command)) {
// 				const { id } = ctx.update.message.from;
//
// 				const getUser = await Users.findOne({ id });
//
// 				if (!getUser || getUser.status !== "admin") {
// 					ctx.reply(`You have no permission to use this command`);
// 					return;
// 				}
// 			}
// 		}
// 	}
// 	return next();
// };
