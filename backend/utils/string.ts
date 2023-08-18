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
