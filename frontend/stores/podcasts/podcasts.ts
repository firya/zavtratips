import { defineStore } from "pinia";

import { PodcastAddBody, PodcastItem, PodcastsState } from "./podcasts.types";
import { Api } from "~/api";
import { AxiosError } from "axios";

export const usePodcastsStore = defineStore("podcasts", {
  state: (): PodcastsState => ({
    page: 1,
    pageSize: 20,
    list: [],
    query: "",
    current: null,
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
          date: date ? new Date(date) : date,
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
    setCurrent(current: PodcastsState["current"]) {
      this.current = current;
    },
    async addPodcasts(data: PodcastAddBody) {
      this.isFetching = true;
      try {
        const res = await Api<PodcastAddBody>("/podcasts/add", {
          data: data,
          method: "post",
        });

        if (!res) return;

        this.$message.add({
          severity: "success",
          summary: "Подкаст успешно добавлен",
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
    async updatePodcasts(row: number, data: PodcastAddBody) {
      this.isFetching = true;
      try {
        const res = await Api<PodcastAddBody>(`/podcasts/update/${row}`, {
          data: data,
          method: "post",
        });

        if (!res) return;

        this.$message.add({
          severity: "success",
          summary: "Подкаст успешно обновлен",
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
    async removePodcast(row: number) {
      this.isFetching = true;
      try {
        const res = await Api<PodcastAddBody>(`/podcasts/remove/${row}`, {
          method: "delete",
        });

        if (!res) return;

        this.$message.add({
          severity: "success",
          summary: "Подкаст успешно удален",
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
    async updateTable() {
      this.isFetching = true;
      try {
        const res = await Api(`/podcasts/updateTable`, {
          method: "post",
        });

        if (!res) return;

        this.$message.add({
          severity: "success",
          summary: "Таблица подкастов успешно обновлена",
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
