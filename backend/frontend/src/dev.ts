/*
	Two ngrock instance for bot backend
	For local use only
*/

const ngrockUrl: string = "https://a07b-46-246-41-169.eu.ngrok.io";

export const hostURL: string =
  process.env.NODE_ENV !== "production" ? `${ngrockUrl}` : "";
