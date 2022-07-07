/*
	Two ngrock instances for bot backend and Web App
	For local use only
*/

const ngrockUrl: string = "https://8478-5-253-204-100.eu.ngrok.io";
const ngrockUrlWebApp: string = "https://eb76-5-253-204-100.eu.ngrok.io";

export const hostURL: string =
	process.env.NODE_ENV == "development"
		? `${ngrockUrl}`
		: `https://${process.env.VIRTUAL_HOST}:3000`;

export const webAppURL: string =
	process.env.NODE_ENV == "development"
		? `${ngrockUrlWebApp}`
		: `https://${process.env.VIRTUAL_HOST}`;
