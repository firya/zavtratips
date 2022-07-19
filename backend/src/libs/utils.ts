export const leftPad = (num: number, length: number = 2): string => {
  const sign = num < 0 ? "-" : "";
  num = Math.abs(num);
  if (num === Infinity) return num.toString();
  return sign + num.toString().padStart(length, "0");
};

export const formatDate = (date: Date, join: string = "."): string => {
  return [
    leftPad(date.getDate()),
    leftPad(date.getMonth() + 1),
    date.getFullYear(),
  ].join(join);
};

export const splitName = (
  value: string
): { name: string; anothername: string; description: string } => {
  const bracketsRegExp = new RegExp(/\((.*?)\)/);
  var brackets = value.match(bracketsRegExp);

  let description: string = "";
  if (brackets) {
    description = brackets[1];
  }

  const allNames: string = value.replace(bracketsRegExp, "");
  const nameArr: string[] = allNames.split(" / ");

  let anotherName: string = "";

  if (nameArr.length > 1) {
    anotherName = nameArr.slice(1).join(" / ").trim();
  }

  const name: string = nameArr[0].trim();

  return { name: name, anothername: anotherName, description: description };
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
  return `${leftPad(Math.floor(totalSeconds / (60 * 60)))}:${leftPad(
    Math.floor((totalSeconds % (60 * 60)) / 60)
  )}:${leftPad(Math.floor(totalSeconds % 60))}`;
};

export const strToDate = (date: string): Date => {
  const dateArr = date.split(".");
  if (dateArr.length !== 3) return new Date();

  const [day, month, year] = dateArr.map((item) => parseInt(item, 10));
  if (!day || !month || !year) return new Date();
  return new Date(year, month - 1, day);
};

export const dateDifference = (date1: Date, date2: Date): string => {
  const diff = new Date(date2.getTime() - date1.getTime());

  const years = diff.getUTCFullYear() - 1970;
  const months = diff.getMonth();
  const days = diff.getDate();

  return `${wordDeclension(years, ["год", "года", "лет"])} ${wordDeclension(
    months,
    ["месяц", "месяца", "месяцев"]
  )} ${wordDeclension(days, ["день", "дня", "дней"])}`;
};

export const wordDeclension = (num: number, words: string[]): string => {
  if (words.length !== 3) return num.toString();
  const sign = num < 0 ? "-" : "";
  num = Math.abs(num);
  const cases = [2, 0, 1, 1, 1, 2];
  return `${sign}${num} ${
    words[
      num % 100 > 4 && num % 100 < 20 ? 2 : cases[num % 10 < 5 ? num % 10 : 5]
    ]
  }`;
};

export const convertYoutubeDuration = (duration: string): string => {
  if (!duration) return "00:00:00";

  let match: string[] = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

  if (!match) return "00:00:00";

  match = match.slice(1).map(function (x) {
    if (x != null) {
      return x.replace(/\D/, "");
    }
  });

  const hours: number = match[0] ? parseInt(match[0]) : 0;
  const minutes: number = match[1] ? parseInt(match[1]) : 0;
  const seconds: number = match[2] ? parseInt(match[2]) : 0;

  return `${leftPad(hours)}:${leftPad(minutes)}:${leftPad(seconds)}`;
};
