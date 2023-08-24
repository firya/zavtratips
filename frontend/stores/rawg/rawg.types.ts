export type RawgState = {
  list: RawgItem[];
  current: number | null;
  isFetching: boolean;
};

export type RawgItem = {
  title: string;
  year: string;
  link?: string;
} & RawgAdditionalData;

export type RawgAdditionalData = {
  genres?: string;
  image?: string;
  length?: string;
  platforms?: string;
  rating?: string;
  releasedate?: Date;
};
