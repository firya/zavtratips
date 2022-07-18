import { Composer } from "telegraf";

import ConfigModel from "../models/config";
import RowModel from "../models/row";

import {
  podcastStat,
  totalStat,
  streamStat,
  podcastStatMessage,
  totalStatMessage,
} from "../libs/stat";
import { splitName } from "../libs/utils";

interface ImessageProps {
  image: string;
  title: string;
  description: string;
  message: string;
}

const statsQueries = [
  "Статистика подкастов",
  "Статистика завтракаста",
  "Статистика ДТКД",
  "Статистика стримов",
  "Статистика Димы",
  "Статистика Тимура",
  "Статистика Максима",
];

export default Composer.on("inline_query", async (ctx) => {
  const { query } = ctx.inlineQuery;
  const results = [
    ...(await getStatsList(query)),
    ...(await getRecommendationList(query)),
  ];

  return await ctx.answerInlineQuery(
    results.slice(0, 50).map((item, i) => ({
      id: i.toString(),
      type: "article",
      thumb_url: item.image,
      title: item.title,
      description: item.description,
      input_message_content: {
        message_text: item.message,
        parse_mode: "Markdown",
      },
    }))
  );
});

const getStatsList = async (query): Promise<ImessageProps[]> => {
  const foundQueries = statsQueries.filter(
    (item) => item.search(new RegExp(query, "gi")) !== -1
  );

  let results = [];

  for await (const foundQuery of foundQueries) {
    if (foundQuery === "Статистика подкастов") {
      results.push({
        image: "https://m.media-amazon.com/images/I/41b0qMQXitL.jpg",
        title: "Статистика подкастов",
        description: "Суммарная статистика подкаста Завтракаст и шоу ДТКД",
        message: `*Статистика подкастов* \n${podcastStatMessage(
          await podcastStat()
        )}\n\n*Рекомендации ведущих* \n${totalStatMessage(await totalStat())}`,
      });
    } else if (foundQuery === "Статистика завтракаста") {
      results.push({
        image: "https://m.media-amazon.com/images/I/41b0qMQXitL.jpg",
        title: "Статистика завтракаста",
        description: "Суммарная статистика подкаста Завтракаст",
        message: `*Статистика завтракаста* \n${podcastStatMessage(
          await podcastStat("Zavtracast")
        )}\n\n*Рекомендации ведущих* \n${totalStatMessage(
          await totalStat({ podcastName: "Zavtracast" })
        )}`,
      });
    } else if (foundQuery === "Статистика ДТКД") {
      results.push({
        image:
          "https://images.unsplash.com/photo-1485579149621-3123dd979885?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxMTc3M3wwfDF8c2VhcmNofDN8fHBvZGNhc3R8ZW58MHx8fHwxNjU2MzExMDcw&ixlib=rb-1.2.1&q=80&w=200",
        title: "Статистика ДТКД",
        description: "Суммарная статистика шоу ДТКД",
        message: `*Статистика ДТКД* \n${podcastStatMessage(
          await podcastStat("ДТКД")
        )}\n\n*Рекомендации ведущих* \n${totalStatMessage(
          await totalStat({ podcastName: "ДТКД" })
        )}`,
      });
    } else if (foundQuery === "Статистика стримов") {
      results.push({
        image: "https://m.media-amazon.com/images/I/41b0qMQXitL.jpg",
        title: "Статистика стримов",
        description: "Суммарная статистика стримов",
        message: `*Статистика стримов* \n${podcastStatMessage(
          await streamStat()
        )}`,
      });
    } else if (foundQuery === "Статистика Димы") {
      results.push({
        image:
          "https://pbs.twimg.com/profile_images/1513503405918019592/-VQhTmKO_400x400.jpg",
        title: "Статистика Димы",
        description: "Суммарная статистика Димы",
        message: `*Рекомендации Димы* \n${totalStatMessage(
          await totalStat({ hostName: "Дима" })
        )}`,
      });
    } else if (foundQuery === "Статистика Тимура") {
      results.push({
        image:
          "https://assets.fireside.fm/file/fireside-images/podcasts/images/e/e6252e58-0f10-4d00-8be5-5fd8eb58aa34/guests/3/34d8a179-9483-4ffd-9a80-593973dfe2c6/avatar_small.jpg?v=0",
        title: "Статистика Тимура",
        description: "Суммарная статистика Тимура",
        message: `*Рекомендации Тимура* \n${totalStatMessage(
          await totalStat({ hostName: "Тимур" })
        )}`,
      });
    } else if (foundQuery === "Статистика Максима") {
      results.push({
        image:
          "https://assets.fireside.fm/file/fireside-images/podcasts/images/e/e6252e58-0f10-4d00-8be5-5fd8eb58aa34/guests/c/c3a19e36-05f2-4b20-b598-7eac92d6d1c4/avatar_small.jpg?v=0",
        title: "Статистика Максима",
        description: "Суммарная статистика Максима",
        message: `*Рекомендации Максима* \n${totalStatMessage(
          await totalStat({ hostName: "Максим" })
        )}`,
      });
    }
  }

  return results;
};

const getRecommendationList = async (
  query: string
): Promise<ImessageProps[]> => {
  const config = await ConfigModel.findOne({
    sheetUrl: process.env.GOOGLE_SPREADSHEET_URL,
  });

  const records = await RowModel.find({
    [`data.${config.findBy.columnName}`]: {
      $regex: query,
      $options: "i",
    },
    limit: 50,
    sheetTitle: config.findBy.sheetTitle,
  });

  const sheetConfig = config.sheetList.find(
    (sheet) => sheet.title === config.findBy.sheetTitle
  );

  const results = [];

  for (const record of records) {
    const recomendations = getRecommendations(record, sheetConfig);

    const splittedName = splitName(record.data["Название"]);

    if (!results.some((result) => result.title === splittedName.name)) {
      results.push({
        title: splittedName.name,
        description: record.data["Тип"],
        image: record.data["Изображение"],
        url: record.data["Ссылка"],
        platforms: record.data["Платформы"],
        rating: record.data["Рейтинг"],
        genre: record.data["Жанр"],
        release: record.data["Дата релиза"],
        length: record.data["Продолжительность"],
        recommendations: recomendations ? [recomendations] : [],
      });
    } else {
      const resultIndex = results.findIndex(
        (result) => result.title === splittedName.name
      );

      if (recomendations && resultIndex !== -1) {
        results[resultIndex].recommendations.push(recomendations);
      }
    }
  }

  return results.map((item) => ({
    image: item.image,
    title: item.title,
    description: item.description,
    message: generateMessage(item),
  }));
};

const generateMessage = (row): string => {
  let message = `*${row.title}*\n`;

  if (row.url !== "") {
    try {
      const parsedUrl = new URL(row.url);
      message += `\n[${parsedUrl.hostname}](${row.url})`;
    } catch (e) {
      message += `\n[${row.url}](${row.url})`;
    }
  }
  if (row.platforms !== "") {
    message += `\nПлатформы: ${row.platforms}`;
  }
  if (row.rating !== "") {
    message += `\nРейтинг: ${row.rating}`;
  }
  if (row.genre !== "") {
    message += `\nЖанр: ${row.genre}`;
  }
  if (row.release !== "") {
    message += `\nДата релиза: ${row.release}`;
  }
  if (row.length !== "") {
    message += `\nПродолжительность: ${row.length}`;
  }
  message +=
    "\n" +
    row.recommendations
      .map((rec) => {
        return `\n*${rec.title}*:\n${rec.who
          .map((who) => {
            return `${who.name}: ${who.value}`;
          })
          .join("\n")}`;
      })
      .join("\n");

  return message;
};

const getRecommendations = (row, sheetConfig) => {
  return {
    title: sheetConfig.recommendationColumns.meta
      .map((column) => row.data[column])
      .join(" — ")
      .trim(),
    who: sheetConfig.recommendationColumns.who
      .map((column) =>
        row.data[column] != ""
          ? {
              name: column,
              value: row.data[column],
            }
          : false
      )
      .filter((item) => item),
  };
};
