import { strToDate } from "../../utils";
import { ColumnMapType } from "./index.types";
import { getAllExcelRows } from "./common";
import { RecommendationsRow } from "../recommendation";

const RECOMMENDATIONS_COLUMN_MAP: ColumnMapType<keyof RecommendationsRow> = {
  date: {
    label: "Дата",
    transform: (val: string) => strToDate(val).toISOString(),
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
  platforms: {
    label: "Платформы",
  },
  rating: {
    label: "Рейтинг",
  },
  genres: {
    label: "Жанр",
  },
  releaseDate: {
    label: "Дата релиза",
    transform: (val: string) => (val ? strToDate(val).toISOString() : null),
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
