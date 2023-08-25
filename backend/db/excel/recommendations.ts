import { formatDate, getDomain, strToDate } from "../../utils";
import { ColumnMapType } from "./index.types";
import {
  addExcelRow,
  getAllExcelRows,
  removeExcelRow,
  updateExcelRow,
} from "./common";
import { RecommendationsRow } from "../recommendation";

const RECOMMENDATIONS_COLUMN_MAP: ColumnMapType<keyof RecommendationsRow> = {
  date: {
    label: "Дата",
    transform: (val: string) => strToDate(val)?.toISOString(),
    transformExcel: (val: string) => formatDate(new Date(val), "us"),
  },
  podcast: {
    label: "Выпуск",
  },
  type: {
    label: "Тип",
  },
  title: {
    label: "Название",
  },
  link: {
    label: "Ссылка",
  },
  image: {
    label: "Изображение",
  },
  description: {
    label: "Описание",
  },
  platforms: {
    label: "Платформы",
  },
  rating: {
    label: "Рейтинг",
  },
  genres: {
    label: "Жанр",
  },
  releasedate: {
    label: "Дата релиза",
    transform: (val: string) => (val ? strToDate(val)?.toISOString() : null),
    transformExcel: (val: string) => formatDate(new Date(val), "us"),
  },
  length: {
    label: "Продолжительность",
  },
  dima: {
    label: "Дима",
  },
  timur: {
    label: "Тимур",
  },
  maksim: {
    label: "Максим",
  },
  guest: {
    label: "Гость",
  },
};

const SHEET_NAME = "Рекомендации";
const START_ROW = 2;

export const getAllExcelRecommendations = async () => {
  return await getAllExcelRows<
    RecommendationsRow,
    ColumnMapType<keyof RecommendationsRow>
  >(SHEET_NAME, START_ROW, RECOMMENDATIONS_COLUMN_MAP);
};

export const addExcelRecommendation = async (
  row: Partial<RecommendationsRow>,
) => {
  return await addExcelRow(SHEET_NAME, row, RECOMMENDATIONS_COLUMN_MAP);
};

export const updateExcelRecommendation = async (
  rowNumber: number,
  row: Partial<RecommendationsRow>,
) => {
  return await updateExcelRow(
    SHEET_NAME,
    rowNumber - START_ROW,
    row,
    RECOMMENDATIONS_COLUMN_MAP,
  );
};

export const removeExcelRecommendation = async (rowNumber: number) => {
  return await removeExcelRow(SHEET_NAME, rowNumber - START_ROW);
};

export const prepareRecommendationData = (
  row: RecommendationsRow,
): RecommendationsRow => {
  let description = row.link
    ? `<p><a href='${row.link}'>${getDomain(row.link)}</a></p>`
    : "";
  description += row.genres ? `<p>Жанры: Shooter</p>` : "";
  description += row.platforms ? `<p>Платформы: PC</p>` : "";
  description += row.releasedate ? `<p>Дата релиза: 18.07.2023</p>` : "";

  return {
    date: row.date,
    podcast: row.podcast,
    type: row.type,
    title: row.title,
    link: row.link,
    image: row.image
      ? row.image
      : "https://lh3.googleusercontent.com/proxy/9x18kFTI33ntQXwjFLGyaoXRVr13wziRUrSFUNlvjJ6EF5jN8QlGSXFDJClMsZ3QzepLH9Ti_XXlegFGbfW7zxWpNiN9R1hL6iHktnIBq1rS3DI64wQTx-Pfgct5Jzy7id887McTNABuP82DAWec",
    description: description,
    platforms: row.platforms,
    rating: row.rating,
    genres: row.genres,
    releasedate: row.releasedate,
    length: row.length,
    dima: row.dima,
    timur: row.timur,
    maksim: row.maksim,
    guest: row.guest,
  };
};
