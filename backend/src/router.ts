import * as RowsController from "./controllers/row";
import * as SearchController from "./controllers/search";
import { verifyTelegramWebAppData, verifyUser } from "./libs/api";

export default (app) => {
	app.post("/api/*", checkPermissions);

	app
		.route("/api/rows")
		.get(RowsController.listAllRows)
		.post(RowsController.createRow)
		.put(RowsController.updateRow);

	app.route("/api/search").get(SearchController.getSuggestions);
};

const checkPermissions = async (req, res, next) => {
	const { dataCheckString } = req.body;
	if (
		verifyTelegramWebAppData(dataCheckString) &&
		(await verifyUser(dataCheckString))
	) {
		next();
	} else {
		res.statusCode = 403;
		res.json({
			error: {
				code: 403,
				message: "You have no permission",
			},
		});
	}
};
