import { pluralWord } from "./string";

export const dateDifference = (date1: Date, date2: Date): string => {
  const diff = new Date(date2.getTime() - date1.getTime());

  const years = diff.getUTCFullYear() - 1970;
  const months = diff.getMonth();
  const days = diff.getDate();

  return `${pluralWord(years, ["год", "года", "лет"])} 
  ${pluralWord(months, ["месяц", "месяца", "месяцев"])} 
  ${pluralWord(days, ["день", "дня", "дней"])}`;
};

const dateFormatMap = {
  us: {
    separator: "/",
    func: (date: number[]) => new Date(date[2], date[0] - 1, date[1]),
  },
  ru: {
    separator: ".",
    func: (date: number[]) => new Date(date[2], date[1] - 1, date[0]),
  },
};

type DateType = keyof typeof dateFormatMap;

export const strToDate = (date: string): Date | null => {
  const dateType: DateType = date.indexOf("/") !== -1 ? "us" : "ru";
  const dateArr = date
    .split(dateFormatMap[dateType].separator)
    .map((item) => parseInt(item.trim(), 10));

  if (dateArr.length !== 3) return null;
  if (dateArr.some(Number.isNaN)) return null;

  return dateFormatMap[dateType].func(dateArr);
};

export const sumTime = (time: string[]): string => {
  const totalSeconds = time.reduce((acc, cur) => {
    if (!cur) return acc;
    const timeArr = cur.split(":").map((item) => parseInt(item, 10));

    const [hours, minutes, seconds] = new Array(3)
      .fill(0)
      .map((_, i) => (timeArr[i] ? timeArr[i] : 0));

    return acc + hours * 60 * 60 + minutes * 60 + seconds;
  }, 0);
  return `${String(Math.floor(totalSeconds / (60 * 60))).padStart(
    2,
    "0",
  )}:${String(Math.floor((totalSeconds % (60 * 60)) / 60)).padStart(
    2,
    "0",
  )}:${String(Math.floor(totalSeconds % 60)).padStart(2, "0")}`;
};

export type DateFormat = "ru" | "us";

export const formatDate = (date: Date, format: DateFormat = "ru"): string => {
  if (!date) return "";

  switch (format) {
    case "us":
      return [
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
        date.getFullYear(),
      ].join("/");
    default:
      return [
        String(date.getDate()).padStart(2, "0"),
        String(date.getMonth() + 1).padStart(2, "0"),
        date.getFullYear(),
      ].join(".");
  }
};
