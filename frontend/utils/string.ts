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
