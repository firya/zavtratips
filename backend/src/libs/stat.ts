import RowModel from "../models/row";
import { sumTime, strToDate, dateDifference } from "../libs/utils";

interface IpodcastStat {
  onAir: string;
  count: number;
  length: string;
}

interface ItotalStat {
  total: number;
  byType: {};
}

interface ItotalStatProps {
  hostName?: string;
  podcastName?: string;
}

export const podcastStat = async (
  showName: string = ""
): Promise<IpodcastStat> => {
  const filter = { sheetTitle: "Выпуски" };
  if (showName !== "") {
    filter[`data.Шоу`] = showName;
  }
  const podcasts = await RowModel.find(filter);

  if (podcasts.length === 0) return { onAir: "", count: 0, length: "" };

  return {
    onAir: dateDifference(strToDate(podcasts[0].data["Дата"]), new Date()),
    count: podcasts.length,
    length: sumTime(podcasts.map((item) => item.data["Продолжительность"])),
  };
};

export const podcastStatMessage = (stats: IpodcastStat): string => {
  return `🗓 В эфире: ${stats.onAir}\n🎙 Количество выпусков: ${stats.count}\n⏱ Общая длительность: ${stats.length}`;
};

export const totalStat = async ({
  hostName = "",
  podcastName = "",
}: ItotalStatProps = {}): Promise<ItotalStat> => {
  const filter = {
    sheetTitle: "Рекомендации",
  };

  if (hostName !== "") {
    filter[`data.${hostName}`] = { $ne: "" };
  }

  if (podcastName !== "") {
    filter[`data.Выпуск`] = { $regex: podcastName, $options: "i" };
  }

  const recommendations = await RowModel.find(filter);

  if (recommendations.length === 0) return { total: 0, byType: {} };

  return {
    total: recommendations.length,
    byType: countByType(recommendations),
  };
};

export const totalStatMessage = (stats: ItotalStat): string => {
  return `❗️ Всего рекомендаций: ${stats.total}\nПо типам: \n${Object.keys(
    stats.byType
  )
    .map((key) => `${key}: ${stats.byType[key]}`)
    .join("\n")}`;
};

const countByType = (array: any[]) => {
  const result = {};

  array.forEach((item) => {
    if (item.data["Тип"]) {
      if (result[item.data["Тип"]]) {
        result[item.data["Тип"]]++;
      } else {
        result[item.data["Тип"]] = 1;
      }
    }
  });

  return result;
};
