/*
	Two ngrock instance for bot backend
	For local use only
*/

const ngrockUrl: string = "https://3002-46-246-41-165.eu.ngrok.io";

export const hostURL: string =
  process.env.NODE_ENV !== "production" ? `${ngrockUrl}` : "";
