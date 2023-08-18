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
  const pool = DB.getInstance();
  try {
    await removeAccountsTable(pool);
    await removeConfigTable(pool);
    await removePodcastsTable(pool);
    await removeRecommendationsTable(pool);
    await removeStreamsTable(pool);
  } catch (e) {
    console.log(e);
  }
};

export const createAllTables = async () => {
  const pool = DB.getInstance();
  const promises = [
    await createConfigTable(pool),
    await createAccountsTable(pool),
    await createPodcastTable(pool),
    await createRecommendationsTable(pool),
    await createStreamsTable(pool),
  ];

  void Promise.all(promises);
};
