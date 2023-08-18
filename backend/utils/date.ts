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

export const strToDate = (date: string): Date => {
  const dateArr = date.split(".");
  if (dateArr.length !== 3) return new Date();

  const [day, month, year] = dateArr.map((item) => parseInt(item, 10));
  if (!day || !month || !year) return new Date();
  return new Date(year, month - 1, day);
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

export const formatDate = (date: Date, join: string = "."): string => {
  return [
    String(date.getDate()).padStart(2, "0"),
    String(date.getMonth() + 1).padStart(2, "0"),
    date.getFullYear(),
  ].join(join);
};
