import { defineStore } from "pinia";
import { Api } from "~/api";
import {
  RecommendationAddBody,
  RecommendationItem,
  RecommendationsState,
} from "./recommendations.types";
import { AxiosError } from "axios";

export const useRecommendationsStore = defineStore("recommendations", {
  state: (): RecommendationsState => ({
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
    setCurrent(current: RecommendationsState["current"]) {
      this.current = current;
    },
    async addRecommendation(data: RecommendationAddBody) {
      this.isFetching = true;
      try {
        const res = await Api<RecommendationAddBody>("/recommendations/add", {
          data: data,
          method: "post",
        });

        if (!res) return;

        this.$message.add({
          severity: "success",
          summary: "Рекомендация успешно добавлен",
          life: 3000,
        });
        return res;
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
    async updateRecommendation(row: number, data: RecommendationAddBody) {
      this.isFetching = true;
      try {
        const res = await Api<RecommendationAddBody>(
          `/recommendations/update/${row}`,
          {
            data: data,
            method: "post",
          },
        );

        if (!res) return;

        this.$message.add({
          severity: "success",
          summary: "Рекомендация успешно обновлена",
          life: 3000,
        });
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
    async removeRecommendation(row: number) {
      this.isFetching = true;
      try {
        const res = await Api<RecommendationItem>(
          `/recommendations/remove/${row}`,
          {
            method: "delete",
          },
        );

        if (!res) return;

        this.$message.add({
          severity: "success",
          summary: "Рекомендация успешно удалена",
          life: 3000,
        });
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
