export type PodcastsState = {
  list: PodcastItem[];
  page: number;
  pageSize: number;
  query: string;
  isFetching: boolean;
};

export type PodcastItem = {
  date: Date;
  length: string;
  podcast: string;
  number: string;
  podcastnumber: string;
  row: number;
  title: string;
};
