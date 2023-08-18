import { strToDate } from "../../utils";
import { ColumnMapType } from "./index.types";
import { StreamsRow } from "../streams";
import { getAllExcelRows } from "./common";

const STREAM_COLUMN_MAP: ColumnMapType<keyof StreamsRow> = {
  date: {
    label: "Дата",
    transform: (val: string) => strToDate(val).toISOString(),
  },
  title: {
    label: "Название",
  },
  link: {
    label: "Ссылка",
  },
  length: {
    label: "Продолжительность",
  },
};

const SHEET_NAME = "Стримы";
const START_ROW = 3;

export const getAllExcelStreams = async () => {
  return await getAllExcelRows<StreamsRow, ColumnMapType<keyof StreamsRow>>(
    SHEET_NAME,
    START_ROW,
    STREAM_COLUMN_MAP,
  );
};
