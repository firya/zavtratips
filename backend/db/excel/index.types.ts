export type ColumnMapType<T extends string = string> = Partial<
  Record<T, ColumnType>
>;

export type ColumnType = {
  label: string;
  transform?: (val: string) => unknown;
};
