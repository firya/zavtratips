import { getRowList, addRows } from "../libs/googlespreadsheet";
import { formatDate } from "../utils";
import { getPlaylistVideos } from "../libs/youtube";

export const downloadStreamList = async () => {
  const rowData = await getRowList("Стримы", 3);

  let allVideos = await getPlaylistVideos({
    playlistId: "PLRd7kI_0sLY4wThdB1QQcLEvE5HwdZ_mR",
  });

  if (!allVideos || !rowData) return;

  allVideos = allVideos.filter(
    (item) =>
      !rowData.some(
        (row) => row["Ссылка"] === `https://www.youtube.com/watch?v=${item.id}`,
      ),
  );
  allVideos = allVideos.sort((a, b) => a.date.getTime() - b.date.getTime());
  allVideos = allVideos.filter((row) => row.duration !== "00:00:00");

  // TODO: move it
  await addRows(
    "Стримы",
    allVideos.map((row) => ({
      Дата: formatDate(row.date),
      Название: row.title,
      Ссылка: `https://www.youtube.com/watch?v=${row.id}`,
      Продолжительность: row.duration,
    })),
  );

  console.log(`Add ${allVideos.length} streams`);
};
