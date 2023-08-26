import { InlineReplyMessage } from "./index.types";
import {
  getRecommendationList,
  RecommendationsRow,
} from "../../db/recommendation";
import { formatDate, typedObjectKeys } from "../../utils";

export const getRecommendationInlineResults = async (
  query: string,
): Promise<InlineReplyMessage[]> => {
  const res = await getRecommendationList([
    "date",
    "podcast",
    "type",
    "title",
    "link",
    "image",
    "platforms",
    "rating",
    "genres",
    "releasedate",
    "length",
    "dima",
    "timur",
    "maksim",
    "guest",
  ]);

  if (!res) return [];

  const filteredRecommendations = res
    .filter((row) => row.title.search(new RegExp(query, "gi")) !== -1)
    .slice(0, 50);

  if (!filteredRecommendations.length) return [];

  const grouppedRecommendations = filteredRecommendations.reduce<
    Record<string, RecommendationsRow[]>
  >((acc, row) => {
    if (!acc[row.title]) acc[row.title] = [];
    acc[row.title].push(row);
    return acc;
  }, {});

  return typedObjectKeys(grouppedRecommendations).map((title) => ({
    image: grouppedRecommendations[title][0].image,
    title: title,
    description: grouppedRecommendations[title][0].type,
    message: generateMessage(grouppedRecommendations[title]),
  }));
};

const generateMessage = (row: RecommendationsRow[]) => {
  const { title, link, platforms, rating, genres, releasedate, length } =
    row[0];

  let message = `*${title}*\n\n`;

  if (link) {
    try {
      const parsedUrl = new URL(link);
      message += `[${parsedUrl.hostname}](${link})\n`;
    } catch (e) {
      message += `[${link}](${link})\n`;
    }
  }
  if (platforms) {
    message += `Платформы: ${platforms}\n`;
  }
  if (rating) {
    message += `Рейтинг: ${rating}\n`;
  }
  if (genres) {
    message += `Жанр: ${genres}\n`;
  }
  if (releasedate) {
    message += `Дата релиза: ${formatDate(new Date(releasedate))}\n`;
  }
  if (length !== "") {
    message += `Продолжительность: ${length}\n`;
  }

  const recommendations = row.map(
    ({ date, podcast, dima, timur, maksim, guest }) => {
      let recMessage = `\n*${formatDate(new Date(date))} — ${podcast}*:\n`;
      if (dima) recMessage += `Дима: ${dima}\n`;
      if (timur) recMessage += `Тимур: ${timur}\n`;
      if (maksim) recMessage += `Максим: ${maksim}\n`;
      if (guest) recMessage += `Гость: ${guest}\n`;

      return recMessage;
    },
  );

  message += recommendations.join("\n");

  return message;
};
