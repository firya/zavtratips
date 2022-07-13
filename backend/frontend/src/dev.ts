/*
	Two ngrock instance for bot backend
	For local use only
*/

const ngrockUrl: string = "https://6d22-46-246-41-171.eu.ngrok.io";

export const hostURL: string =
	process.env.NODE_ENV !== "production" ? `${ngrockUrl}` : "";
