export type PodcastsState = {
  list: PodcastItem[];
  page: number;
  pageSize: number;
  query: string;
  current: number | null;
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

export type PodcastAddBody = {
  date?: Date | null;
  podcast?: string;
  number: string;
  title?: string;
  length?: string;
};
