export type RawgState = {
  list: RawgItem[];
  current: number | null;
  isFetching: boolean;
};

export type RawgItem = {
  title: string;
  year: string;
  link?: string;
};
