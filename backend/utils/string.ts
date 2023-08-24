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

export const getDomain = (link: string) => {
  if (!link) return "";
  try {
    const url = new URL(link);

    return url.hostname;
  } catch (e) {
    console.log(e);
  }
};
