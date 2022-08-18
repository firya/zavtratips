import * as RowsController from "./controllers/row";
import * as SearchController from "./controllers/search";
import * as ConfigController from "./controllers/config";
import { verifyTelegramWebAppData, verifyUser } from "./libs/api";

export default (app) => {
  // app.post("/api/*", checkPermissions).put("/api/*", checkPermissions);

  app
    .route("/api/rows")
    .get(RowsController.listAllRows)
    .post(RowsController.createRow)
    .put(RowsController.updateRow);

  app.route("/api/search").get(SearchController.getSuggestions);
  app.route("/api/config").get(ConfigController.getConfig);
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
