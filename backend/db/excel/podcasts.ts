import { strToDate } from "../../utils";
import { ColumnMapType } from "./index.types";
import { getAllExcelRows } from "./common";
import { PodcastsRow } from "../podcasts";

const PODCASTS_COLUMN_MAP: ColumnMapType<keyof PodcastsRow> = {
  date: {
    label: "Дата",
    transform: (val: string) => strToDate(val)?.toISOString(),
  },
  podcast: {
    label: "Шоу",
  },
  number: {
    label: "Выпуск, №",
  },
  podcastnumber: {
    label: "Шоу и номер",
  },
  title: {
    label: "Название",
  },
  length: {
    label: "Продолжительность",
  },
};

const SHEET_NAME = "Выпуски";
const START_ROW = 3;

export const getAllExcelPodcasts = async () => {
  return await getAllExcelRows<PodcastsRow, ColumnMapType<keyof PodcastsRow>>(
    SHEET_NAME,
    START_ROW,
    PODCASTS_COLUMN_MAP,
  );
};
