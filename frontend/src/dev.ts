/*
	Ngrock instance for bot backend
	For local use only
*/

const ngrockUrl = "https://8478-5-253-204-100.eu.ngrok.io";

export const hostURL =
	process.env.NODE_ENV == "development"
		? `${ngrockUrl}`
		: `https://${process.env.VIRTUAL_HOST}:3000`;
