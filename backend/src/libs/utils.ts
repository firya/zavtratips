export const padTo2Digits = (num: number): string => {
	return num.toString().padStart(2, "0");
};

export const formatDate = (date: Date, join: string = "."): string => {
	return [
		padTo2Digits(date.getDate()),
		padTo2Digits(date.getMonth() + 1),
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
		anotherName = nameArr.slice(1).join(" / ");
	}

	const name: string = nameArr[0];

	return { name: name, anothername: anotherName, description: description };
};
