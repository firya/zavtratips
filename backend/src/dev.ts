/*
	Two ngrock instances for bot backend and Web App
	For local use only
*/

const ngrockUrl: string = "https://5620-46-246-41-173.eu.ngrok.io";
const ngrockWebAppUrl: string = "https://c541-46-246-41-172.eu.ngrok.io";

export const hostURL: string =
	process.env.NODE_ENV !== "production"
		? `${ngrockUrl}`
		: `https://${process.env.VIRTUAL_HOST}`;
export const WebAppUrl: string =
	process.env.NODE_ENV !== "production"
		? `${ngrockWebAppUrl}`
		: `https://${process.env.VIRTUAL_HOST}`;
