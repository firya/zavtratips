/*
	Two ngrock instance for bot backend
	For local use only
*/

const ngrockUrl: string = "https://7b21-196-196-53-62.eu.ngrok.io";

export const hostURL: string =
  process.env.NODE_ENV !== "production" ? `${ngrockUrl}` : "";
