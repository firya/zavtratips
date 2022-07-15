/*
	Two ngrock instance for bot backend
	For local use only
*/

const ngrockUrl: string = "https://db64-46-246-41-172.eu.ngrok.io";

export const hostURL: string =
	process.env.NODE_ENV !== "production" ? `${ngrockUrl}` : "";
