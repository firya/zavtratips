import ConfigModel from "../models/config";
import { getDoc } from "../libs/googlespreadsheet";

export const updateConfig = async () => {
  const doc = await getDoc(process.env.GOOGLE_SPREADSHEET_URL);
  const sheetData = doc.sheetsByTitle["Config"];
  const rows = await sheetData.getRows();

  const typeList: string[] = [];
  const reactionList: string[] = [];
  const showList: string[] = [];

  for (let row of rows) {
    if (row["typeList"]) typeList.push(row["typeList"]);
    if (row["reactionList"]) reactionList.push(row["reactionList"]);
    if (row["showList"]) showList.push(row["showList"]);
  }

  const configData = await ConfigModel.findOneAndUpdate(
    { sheetUrl: process.env.GOOGLE_SPREADSHEET_URL },
    { typeList: typeList, reactionList: reactionList, showList: showList }
  );
};
