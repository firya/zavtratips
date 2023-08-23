import { google } from "googleapis";
import { YoutubeVideoProps } from "./youtube.types";
import { convertYoutubeDuration } from "../utils";

export const getPlaylistVideos = async (
  playlistId: string = "",
  nextPageToken: string = "",
  videoList: YoutubeVideoProps[] = [],
): Promise<YoutubeVideoProps[] | undefined> => {
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

  const videoIds = playlistData.data.items?.reduce<string[]>(
    (acc, item) =>
      item.contentDetails?.videoId
        ? [...acc, item.contentDetails?.videoId]
        : acc,
    [],
  );

  const videoData = await youtube.videos.list({
    part: ["snippet", "contentDetails"],
    id: videoIds,
  });

  videoData.data.items?.map((video) => {
    if (
      !video.id ||
      !video.snippet?.title ||
      !video.snippet.publishedAt ||
      !video.contentDetails?.duration
    )
      return;
    videoList.push({
      id: video.id,
      title: video.snippet.title,
      date: new Date(video.snippet.publishedAt),
      duration: convertYoutubeDuration(video.contentDetails.duration),
    });
  });

  if (playlistData.data.nextPageToken) {
    await getPlaylistVideos(
      playlistId,
      playlistData.data.nextPageToken,
      videoList,
    );
  }

  return videoList.reverse();
};
