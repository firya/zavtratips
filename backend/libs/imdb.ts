import fetch from "node-fetch";
import { ImdbResponse, ImdbSearchResults } from "./imdb.types";

export const getIdfromUrl = (url: string) => {
  if (url === "") return "";
  const matches = url.match(/tt\d+/g);
  return matches ? matches[0] : "";
};

export const clearIMDBurl = (url: string): string => {
  return `https://imdb.com/title/${getIdfromUrl(url)}`;
};

export const getIMDB = async (url: string) => {
  const id: string = getIdfromUrl(url);
  url = clearIMDBurl(url);

  try {
    const response = await fetch(
      `http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&i=${id}`,
    );
    const json = (await response.json()) as ImdbResponse;

    if ("Error" in json) {
      return false;
    }

    return { url, data: json };
  } catch (e) {
    return false;
  }
};
export const searchIMDB = async (query: string) => {
  try {
    const response = await fetch(
      `http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&s=${query}`,
    );
    const json = (await response.json()) as ImdbSearchResults;

    return json.Search.map((item) => ({
      title: item.Title,
      year: item.Year,
      link: `https://www.imdb.com/title/${item.imdbID}`,
    }));
  } catch (e) {
    return false;
  }
};
