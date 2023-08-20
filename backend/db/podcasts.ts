import {
  defaultPageSize,
  dropTable,
  findInTable,
  getAllTable,
  insertIntoTable,
  truncateTable,
} from "./common";
import { DB } from "./index";

export type PodcastsRow = {
  row?: number;
  date: string;
  podcast: string;
  number: string;
  podcastnumber: string;
  title: string;
  length: string;
};

export const DB_NAME = "zt_podcasts";

export const createPodcastTable = async () => {
  const pool = DB.getInstance();

  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS ${DB_NAME} (
            row serial PRIMARY KEY,
            date timestamp default NULL,
            podcast varchar(128),
            number varchar(128),
            podcastnumber varchar(256),
            title varchar(128),
            length varchar(128)
        );`);
  } catch (e) {
    console.log(e);
  }
};

export const removePodcastsTable = async () => {
  try {
    await dropTable(DB_NAME);
  } catch (e) {
    console.log(e);
  }
};

export const clearPodcastsTable = async () => {
  try {
    await truncateTable(DB_NAME);
  } catch (e) {
    console.log(e);
  }
};

export const getAllPodcastList = async (): Promise<
  PodcastsRow[] | undefined
> => {
  try {
    return await getAllTable(DB_NAME, "date");
  } catch (e) {
    console.log(e);
  }
};

export const findPodcasts = async (
  query: string,
  page: number = 1,
  pageSize: number = defaultPageSize,
): Promise<PodcastsRow[] | undefined> => {
  try {
    return await findInTable<PodcastsRow>({
      tableName: DB_NAME,
      queryParam: "podcastnumber",
      queryString: query,
      sortBy: "date",
      page: page,
      limit: pageSize,
    });
  } catch (e) {
    console.log(e);
  }
};

export const insertIntoPodcastsTable = async (rows: PodcastsRow[]) => {
  return insertIntoTable(DB_NAME, rows);
};
