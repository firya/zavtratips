export type PodcastsState = {
  list: PodcastItem[];
  page: number;
  pageSize: number;
};

export type PodcastItem = Record<string, string>;
