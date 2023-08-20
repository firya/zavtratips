import { HowLongToBeatService } from "howlongtobeat";
import fetch from "node-fetch";
import { RawgSearchPesponse } from "./rawg.types";

export const getRAWG = async (url: string) => {
  const splittedUrl: string[] = url.split("/");
  const id: string = splittedUrl[splittedUrl.length - 1];

  try {
    const response = await fetch(
      `https://api.rawg.io/api/games/${id}?key=${process.env.RAWG_API_KEY}`,
    );
    let json = await response.json();

    if (json.name) {
      json = { ...json, ...(await getHLTB(json.name)) };
    }

    return { url, data: json };
  } catch (e) {
    return false;
  }
};

export const getHLTB = async (title: string = "") => {
  const hltbService = new HowLongToBeatService();

  try {
    const result = await hltbService.search(title);

    if (result.length === 0) {
      return false;
    }
    return {
      gameplayMain: result[0].gameplayMain,
      gameplayMainExtra: result[0].gameplayMainExtra,
      gameplayCompletionist: result[0].gameplayCompletionist,
    };
  } catch (e) {
    return false;
  }
};

export const searchRAWG = async (query: string) => {
  try {
    const response = await fetch(
      `https://api.rawg.io/api/games?search=${query}&key=${process.env.RAWG_API_KEY}`,
    );

    const json = (await response.json()) as RawgSearchPesponse;

    return json.results.map((item) => ({
      title: item.name,
      year: item.released.split("-")[0],
      link: `https://rawg.io/games/${item.id}`,
    }));
  } catch (e) {
    console.log(e);
    return false;
  }
};
