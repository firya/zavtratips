import { InlineReplyMessage } from "./index.types";
import { getAllPodcastList } from "../../db/podcasts";
import { dateDifference, sumTime, typedObjectKeys } from "../../utils";
import {
  getRecommendationList,
  RecommendationsRow,
} from "../../db/recommendation";
import { getStreamsList } from "../../db/streams";

type PodcastStats = {
  last: string;
  onAir: string;
  count: number;
  length: string;
};
type TotalStat = {
  total: number;
  byType: Record<string, number>;
};

const statsQueries = [
  "Статистика подкастов",
  "Статистика Zavtrcast",
  "Статистика ДТКД",
  "Статистика стримов",
  "Статистика Димы",
  "Статистика Тимура",
  "Статистика Максима",
];

export const getStatInlineResults = async (query: string) => {
  const foundQueries = statsQueries.filter(
    (item) => item.search(new RegExp(query, "gi")) !== -1,
  );

  const results: InlineReplyMessage[] = [];

  for await (const foundQuery of foundQueries) {
    if (foundQuery === "Статистика подкастов") {
      const podcastStat = await getPodcastsStat();
      const totalStat = await getTotalStat({});

      results.push({
        image: "https://m.media-amazon.com/images/I/41b0qMQXitL.jpg",
        title: "Статистика подкастов",
        description: "Суммарная статистика подкаста Завтракаст и шоу ДТКД",
        message: `*Статистика подкастов* \n${podcastStat}\n\n*Рекомендации ведущих* \n${totalStat}`,
      });
    } else if (foundQuery === "Статистика завтракаста") {
      const podcastStat = await getPodcastsStat("Zavtracast");
      const totalStat = await getTotalStat({ podcast: "Zavtracast" });

      results.push({
        image: "https://m.media-amazon.com/images/I/41b0qMQXitL.jpg",
        title: "Статистика завтракаста",
        description: "Суммарная статистика подкаста Завтракаст",
        message: `*Статистика завтракаста* \n${podcastStat}\n\n*Рекомендации ведущих* \n${totalStat}`,
      });
    } else if (foundQuery === "Статистика ДТКД") {
      const podcastStat = await getPodcastsStat("ДТКД");
      const totalStat = await getTotalStat({ podcast: "ДТКД" });

      results.push({
        image:
          "https://images.unsplash.com/photo-1485579149621-3123dd979885?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxMTc3M3wwfDF8c2VhcmNofDN8fHBvZGNhc3R8ZW58MHx8fHwxNjU2MzExMDcw&ixlib=rb-1.2.1&q=80&w=200",
        title: "Статистика ДТКД",
        description: "Суммарная статистика шоу ДТКД",
        message: `*Статистика ДТКД* \n${podcastStat}\n\n*Рекомендации ведущих* \n${totalStat}`,
      });
    } else if (foundQuery === "Статистика стримов") {
      const streamsStat = await getStreamsStat();

      results.push({
        image: "https://m.media-amazon.com/images/I/41b0qMQXitL.jpg",
        title: "Статистика стримов",
        description: "Суммарная статистика стримов",
        message: `*Статистика стримов* \n${streamsStat}`,
      });
    } else if (foundQuery === "Статистика Димы") {
      const totalStat = await getTotalStat({
        podcast: "Zavtracast",
        host: "dima",
      });

      results.push({
        image:
          "https://pbs.twimg.com/profile_images/1513503405918019592/-VQhTmKO_400x400.jpg",
        title: "Статистика Димы",
        description: "Суммарная статистика Димы",
        message: `*Рекомендации Димы* \n${totalStat}`,
      });
    } else if (foundQuery === "Статистика Тимура") {
      const totalStat = await getTotalStat({
        podcast: "Zavtracast",
        host: "timur",
      });

      results.push({
        image:
          "https://assets.fireside.fm/file/fireside-images/podcasts/images/e/e6252e58-0f10-4d00-8be5-5fd8eb58aa34/guests/3/34d8a179-9483-4ffd-9a80-593973dfe2c6/avatar_small.jpg?v=0",
        title: "Статистика Тимура",
        description: "Суммарная статистика Тимура",
        message: `*Рекомендации Тимура* \n${totalStat}`,
      });
    } else if (foundQuery === "Статистика Максима") {
      const totalStat = await getTotalStat({
        podcast: "Zavtracast",
        host: "maksim",
      });

      results.push({
        image:
          "https://assets.fireside.fm/file/fireside-images/podcasts/images/e/e6252e58-0f10-4d00-8be5-5fd8eb58aa34/guests/c/c3a19e36-05f2-4b20-b598-7eac92d6d1c4/avatar_small.jpg?v=0",
        title: "Статистика Максима",
        description: "Суммарная статистика Максима",
        message: `*Рекомендации Максима* \n${totalStat}`,
      });
    }
  }

  return results;
};

export async function getPodcastsStat(podcast?: string) {
  const res = await getAllPodcastList();

  if (!res) return statMessage({ last: "", onAir: "", count: 0, length: "" });

  const podcastList = podcast
    ? res.filter((row) => row["podcast"] === podcast)
    : [...res];

  const lastElement = podcastList[0];
  const firstElement = podcastList.slice(-1)[0];

  return statMessage({
    last: dateDifference(new Date(lastElement.date), new Date()),
    onAir: dateDifference(new Date(firstElement.date), new Date()),
    count: podcastList.length,
    length: sumTime(podcastList.map((item) => item.length)),
  });
}

export function statMessage(stats: PodcastStats) {
  return `🗓 В эфире: ${stats.onAir}\n⌚️ Последний выпуск: ${stats.last}\n🎙 Количество выпусков: ${stats.count}\n⏱ Общая длительность: ${stats.length}`;
}

export async function getTotalStat({
  podcast,
  host,
}: {
  podcast?: string;
  host?: "dima" | "timur" | "maksim";
}) {
  const res = await getRecommendationList();

  if (!res) return recommendationStatMessage({ total: 0, byType: {} });

  const recommendationList = res.filter((row) => {
    let result = true;

    if (result && podcast) result = row.podcast.includes(podcast);
    if (result && host) result = !!row[host as keyof RecommendationsRow];

    return result;
  });

  return recommendationStatMessage({
    total: recommendationList.length,
    byType: countByType(recommendationList),
  });
}
export function recommendationStatMessage(stats: TotalStat) {
  return `❗️ Всего рекомендаций: ${stats.total}\nПо типам: \n${typedObjectKeys(
    stats.byType,
  )
    .map((key) => `${String(key)}: ${stats.byType[key]}`)
    .join("\n")}`;
}

export function countByType(array: RecommendationsRow[]) {
  const result: Record<string, number> = {};

  array.forEach((item) => {
    if (item.type) {
      if (result[item.type]) {
        result[item.type]++;
      } else {
        result[item.type] = 1;
      }
    }
  });

  return result;
}

export async function getStreamsStat() {
  const res = await getStreamsList();

  if (!res) return statMessage({ last: "", onAir: "", count: 0, length: "" });

  const lastElement = res[0];
  const firstElement = res.slice(-1)[0];

  return statMessage({
    last: dateDifference(new Date(lastElement.date), new Date()),
    onAir: dateDifference(new Date(firstElement.date), new Date()),
    count: res.length,
    length: sumTime(res.map((item) => item.length)),
  });
}
