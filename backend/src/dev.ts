/*
	Two ngrock instances for bot backend and Web App
	For local use only
*/

const ngrockUrl: string = "https://3002-46-246-41-165.eu.ngrok.io";
const ngrockWebAppUrl: string = "https://a35e-46-246-41-165.eu.ngrok.io";

export const hostURL: string =
  process.env.NODE_ENV !== "production"
    ? `${ngrockUrl}`
    : `https://${process.env.VIRTUAL_HOST}`;
export const WebAppUrl: string =
  process.env.NODE_ENV !== "production"
    ? `${ngrockWebAppUrl}`
    : `https://${process.env.VIRTUAL_HOST}`;
