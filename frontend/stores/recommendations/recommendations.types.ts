export type RecommendationsSatate = {
  list: RecommendationItem[];
  page: number;
  pageSize: number;
  podcast: string;
  current: number | null;
  isFetching: boolean;
};

export type RecommendationItem = {
  row: number;
  date: Date;
  podcast: string;
  type: string;
  title: string;
  link: string;
  image: string;
  platforms: string;
  rating: string;
  genres: string;
  releaseDate: string;
  length: string;
  dima: string;
  timur: string;
  maksim: string;
  guest: string;
};
