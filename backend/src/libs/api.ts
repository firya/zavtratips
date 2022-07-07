import CryptoJS from "crypto-js";
import Users from "../models/users";

export const verifyTelegramWebAppData = (telegramInitData: string): boolean => {
	const initData = new URLSearchParams(telegramInitData);
	const hash = initData.get("hash") || "";
	let dataToCheck: string[] = [];

	initData.sort();
	initData.forEach(
		(val, key) => key !== "hash" && dataToCheck.push(`${key}=${val}`)
	);

	const secret = CryptoJS.HmacSHA256(process.env.TELEGRAM_TOKEN, "WebAppData");
	const _hash = CryptoJS.HmacSHA256(dataToCheck.join("\n"), secret).toString(
		CryptoJS.enc.Hex
	);

	return _hash === hash;
};

export const verifyUser = async (
	telegramInitData: string
): Promise<boolean> => {
	const initData = new URLSearchParams(telegramInitData);
	const user: string = initData.get("user") || "{}";

	const { id } = JSON.parse(user);

	const response = await Users.find({ id });

	return response.length === 1;
};
