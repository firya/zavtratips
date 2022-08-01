import { google } from "googleapis";
import { convertYoutubeDuration, formatDate } from "../libs/utils";
import { getRowList, addRows } from "../libs/googlespreadsheet";

export const updateStreamList = async () => {
  const rowData = await getRowList(
    process.env.GOOGLE_SPREADSHEET_URL,
    "Стримы",
    3
  );

  let allVideos = await getPlaylistVideos("PLRd7kI_0sLY4wThdB1QQcLEvE5HwdZ_mR");

  if (rowData.length > 0) {
    allVideos = allVideos.filter(
      (item) =>
        !rowData.some(
          (row) =>
            row["Ссылка"] === `https://www.youtube.com/watch?v=${item.id}`
        )
    );
  }

  allVideos = allVideos.sort((a, b) => a.date.getTime() - b.date.getTime());
  allVideos = allVideos.filter((row) => row.duration !== "00:00:00");

  await addRows(
    process.env.GOOGLE_SPREADSHEET_URL,
    "Стримы",
    allVideos.map((row) => ({
      Дата: formatDate(row.date),
      Название: row.title,
      Ссылка: `https://www.youtube.com/watch?v=${row.id}`,
      Продолжительность: row.duration,
    }))
  );

  console.log(`Add ${allVideos.length} streams`);
};

interface IvideoProps {
  id: string;
  title: string;
  date: Date;
  duration: string;
}

export const getPlaylistVideos = async (
  playlistId: string = "",
  nextPageToken: string = "",
  videoList: IvideoProps[] = []
): Promise<IvideoProps[]> => {
  if (playlistId === "") return;

  const youtube = google.youtube({
    version: "v3",
    auth: process.env.GOOGLE_API_KEY,
  });

  const playlistData = await youtube.playlistItems.list({
    part: ["contentDetails"],
    playlistId: playlistId,
    maxResults: 50,
    pageToken: nextPageToken,
  });

  const videoData = await youtube.videos.list({
    part: ["snippet", "contentDetails"],
    id: playlistData.data.items.map((item) => item.contentDetails.videoId),
  });

  videoData.data.items.map((video) => {
    videoList.push({
      id: video.id,
      title: video.snippet.title.replace(" - Стрим Завтракаста", ""),
      date: new Date(video.snippet.publishedAt),
      duration: convertYoutubeDuration(video.contentDetails.duration),
    });
  });

  if (playlistData.data.nextPageToken) {
    await getPlaylistVideos(
      playlistId,
      playlistData.data.nextPageToken,
      videoList
    );
  }

  return videoList.reverse();
};
