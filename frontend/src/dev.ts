/*
	Ngrock instance for bot backend
	For local use only
*/

const ngrockUrl = "https://8478-5-253-204-100.eu.ngrok.io";

export const hostURL =
	process.env.NODE_ENV !== "production"
		? `${ngrockUrl}`
		: `https://${process.env.REACT_APP_BACKEND_URL}`;
