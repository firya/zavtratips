import { defineStore } from "pinia";

import { PodcastItem, PodcastsState } from "./podcasts.types";
import { Api } from "~/api";
import { AxiosError } from "axios";

export const usePodcastsStore = defineStore("podcasts", {
  state: (): PodcastsState => ({
    page: 1,
    pageSize: 20,
    list: [],
    query: "",
    isFetching: false,
  }),
  actions: {
    setQuery(query: string) {
      this.query = query;
    },
    async getPodcasts() {
      this.isFetching = true;
      try {
        const res = await Api<PodcastItem[]>("/podcasts", {
          params: {
            query: this.query,
            page: this.page,
            pageSize: this.pageSize,
          },
        });

        if (!res) return;

        this.list = res.map(({ date, ...rest }) => ({
          date: new Date(date),
          ...rest,
        }));
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
