import pg from "pg";
import { createAccountsTable, removeAccountsTable } from "./accounts";
import { createConfigTable, removeConfigTable } from "./config";
import { createPodcastTable, removePodcastsTable } from "./podcasts";
import {
  createRecommendationsTable,
  removeRecommendationsTable,
} from "./recommendation";
import { createStreamsTable, removeStreamsTable } from "./streams";

export const DB = (function () {
  const { Pool } = pg;

  let db: pg.Pool | null = null;

  function init() {
    return new Pool({
      connectionString: process.env.POSTGRES_URL + "?sslmode=require",
    });
  }

  return {
    getInstance: () => {
      if (!db) {
        db = init();
      }
      return db;
    },
  };
})();

export const removeAllTables = async () => {
  try {
    await removeAccountsTable();
    await removeConfigTable();
    await removePodcastsTable();
    await removeRecommendationsTable();
    await removeStreamsTable();
  } catch (e) {
    console.log(e);
  }
};

export const createAllTables = async () => {
  const promises = [
    await createConfigTable(),
    await createAccountsTable(),
    await createPodcastTable(),
    await createRecommendationsTable(),
    await createStreamsTable(),
  ];

  void Promise.all(promises);
};
