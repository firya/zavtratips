import ConfigModel from "../models/config";

export const getConfig = async (req, res) => {
  try {
    const result = await ConfigModel.findOne({
      sheetUrl: process.env.GOOGLE_SPREADSHEET_URL,
    });
    res.json(result);
  } catch (e) {
    console.log(e);
    res.json({ error: e });
  }
};
