import { formatDate, strToDate } from "../../utils";
import { ColumnMapType } from "./index.types";
import {
  addExcelRow,
  getAllExcelRows,
  removeExcelRow,
  updateExcelRow,
} from "./common";
import { PodcastsRow } from "../podcasts";

const PODCASTS_COLUMN_MAP: ColumnMapType<keyof PodcastsRow> = {
  date: {
    label: "Дата",
    transform: (val: string) => strToDate(val)?.toISOString(),
    transformExcel: (val: string) => formatDate(new Date(val), "us"),
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
  fullname: {
    label: "Полное название",
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

export const addExcelPodcast = async (row: Partial<PodcastsRow>) => {
  return await addExcelRow(SHEET_NAME, row, PODCASTS_COLUMN_MAP);
};

export const updateExcelPodcast = async (
  rowNumber: number,
  row: Partial<PodcastsRow>,
) => {
  return await updateExcelRow(
    SHEET_NAME,
    rowNumber - START_ROW + 1,
    row,
    PODCASTS_COLUMN_MAP,
  );
};

export const removeExcelPodcast = async (rowNumber: number) => {
  return await removeExcelRow(SHEET_NAME, rowNumber - START_ROW + 1);
};

export const preparePodcastData = (row: PodcastsRow) => {
  const podcastnumber =
    // @ts-expect-error is it number
    Number(row.number) == row.number
      ? `${row.podcast} #${row.number}`
      : `${row.podcast} ${row.number}`;

  return {
    date: row.date,
    podcast: row.podcast,
    number: row.number,
    podcastnumber: podcastnumber,
    title: row.title,
    fullname: row.title
      ? `${podcastnumber} — ${row.title}`
      : `${podcastnumber}`,
    length: row.length,
  };
};
