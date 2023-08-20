import { defineStore } from "pinia";
import { Api } from "~/api";
import { AxiosError } from "axios";

import { ImdbItem, ImdbState } from "./imdb.types";

export const useImdbStore = defineStore("imdb", {
  state: (): ImdbState => ({
    list: [],
    current: null,
    isFetching: false,
  }),
  actions: {
    setCurrent(value: ImdbState["current"]) {
      this.current = value;
    },
    async getImdb(query: string) {
      this.isFetching = true;
      this.current = null;
      try {
        const res = await Api<ImdbItem[]>(`/imdb`, {
          params: {
            query,
          },
        });

        if (!res) return;

        this.list = res;
      } catch (e) {
        this.$message.add({
          severity: "error",
          summary: "Request error",
          detail: (e as AxiosError).message,
          life: 3000,
        });
      } finally {
        this.isFetching = false;
      }
    },
  },
});
