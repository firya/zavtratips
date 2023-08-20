export type ImdbState = {
  list: ImdbItem[];
  current: number | null;
  isFetching: boolean;
};

export type ImdbItem = {
  title: string;
  year: string;
  link?: string;
};
