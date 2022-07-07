export const leftPad = (num: number, length: number = 2): string => {
	return num.toString().padStart(length, "0");
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
		anotherName = nameArr.slice(1).join(" / ");
	}

	const name: string = nameArr[0];

	return { name: name, anothername: anotherName, description: description };
};

export const sumTime = (time: string[]): string => {
	const totalSeconds = time.reduce((acc, cur) => {
		const [hours, minutes, seconds] = cur.split(":");
		return (
			acc +
			parseInt(hours, 10) * 60 * 60 +
			parseInt(minutes, 10) * 60 +
			parseInt(seconds, 10)
		);
	}, 0);
	return `${leftPad(Math.floor(totalSeconds / (60 * 60)))}:${leftPad(
		Math.floor((totalSeconds % (60 * 60)) / 60)
	)}:${leftPad(Math.floor(totalSeconds % 60))}`;
};

export const strToDate = (date: string): Date => {
	const [day, month, year] = date.split(".");
	return new Date(
		parseInt(year, 10),
		parseInt(month, 10) - 1,
		parseInt(day, 10)
	);
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
	const cases = [2, 0, 1, 1, 1, 2];
	return `${num} ${
		words[
			num % 100 > 4 && num % 100 < 20 ? 2 : cases[num % 10 < 5 ? num % 10 : 5]
		]
	}`;
};
