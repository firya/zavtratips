import { defineStore } from "pinia";
import { Api } from "~/api";
import {
  RecommendationItem,
  RecommendationsSatate,
} from "./recommendations.types";
import { AxiosError } from "axios";

export const useRecommendationsStore = defineStore("recommendations", {
  state: (): RecommendationsSatate => ({
    page: 1,
    pageSize: 20,
    list: [],
    podcast: "",
    current: null,
    isFetching: false,
  }),
  actions: {
    setPodcast(podcast: string) {
      this.podcast = podcast;
    },
    async getRecommendations() {
      if (!this.podcast) return;
      this.isFetching = true;
      this.setCurrent(null);

      try {
        const res = await Api<RecommendationItem[]>(
          `/recommendations/${encodeURIComponent(this.podcast)}`,
        );

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
    setCurrent(current: RecommendationsSatate["current"]) {
      this.current = current;
    },
  },
});
