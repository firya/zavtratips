export const pluralWord = (num: number, words: string[]): string => {
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

export const splitName = (
  value: string,
): { name: string; anothername: string; description: string } => {
  const bracketsRegExp = new RegExp(/\((.*?)\)/);
  const brackets = value.match(bracketsRegExp);

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

export const convertYoutubeDuration = (duration: string): string => {
  if (!duration) return "00:00:00";

  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

  if (!match) return "00:00:00";

  const result = match.slice(1).map(function (x) {
    if (x != null) {
      return x.replace(/\D/, "");
    }
  });

  const hours: number = result[0] ? parseInt(result[0]) : 0;
  const minutes: number = result[1] ? parseInt(result[1]) : 0;
  const seconds: number = result[2] ? parseInt(result[2]) : 0;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0",
  )}:${String(seconds).padStart(2, "0")}`;
};
