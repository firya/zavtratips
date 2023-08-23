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

export const strToDate = (date: string): Date | null => {
  const dateArr = date.split(".");
  const dateArrUs = date.split("/");
  if (dateArr.length !== 3 && dateArrUs.length !== 3) return null;

  if (dateArr.length === 3) {
    const [first, second, third] = dateArr.map((item) => parseInt(item, 10));
    return new Date(third, second - 1, first);
  } else {
    const [first, second, third] = dateArrUs.map((item) => parseInt(item, 10));
    return new Date(third, first - 1, second);
  }
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
