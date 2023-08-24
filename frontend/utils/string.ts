type splittedTitle = {
  title: string;
  anotherTitle?: string;
  titleDescription?: string;
};

export const splitTitle = (value: string): splittedTitle => {
  const bracketsRegExp = new RegExp(/\((.*?)\)/);
  const brackets = value.match(bracketsRegExp);

  let titleDescription: string = "";
  if (brackets) {
    titleDescription = brackets[1];
  }

  const allNames: string = value.replace(bracketsRegExp, "");
  const nameArr: string[] = allNames.split(" / ");

  let anotherTitle: string = "";

  if (nameArr.length > 1) {
    anotherTitle = nameArr.slice(1).join(" / ").trim();
  }

  const name: string = nameArr[0].trim();

  return {
    title: name,
    anotherTitle: anotherTitle,
    titleDescription: titleDescription,
  };
};

export const combineTitle = ({
  title,
  anotherTitle,
  titleDescription,
}: splittedTitle) => {
  let result = title;
  if (anotherTitle) result += ` / ${anotherTitle}`;
  if (titleDescription) result += ` (${titleDescription})`;

  return result;
};
