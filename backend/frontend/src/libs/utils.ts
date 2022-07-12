export const generateName = (
	name: string,
	anothername: string,
	description: string
): string => {
	let result = name;

	if (anothername !== "") {
		result += ` / ${anothername}`;
	}
	if (description !== "") {
		result += ` (${description})`;
	}

	return result;
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
