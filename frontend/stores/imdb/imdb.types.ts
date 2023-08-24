export type ImdbState = {
  list: ImdbItem[];
  current: number | null;
  isFetching: boolean;
};

export type ImdbItem = {
  title: string;
  year: string;
  link?: string;
} & ImdbAdditionalData;

export type ImdbAdditionalData = {
  genres?: string;
  image?: string;
  length?: string;
  platforms?: string;
  rating?: string;
  releasedate?: Date;
};
