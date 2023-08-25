import { defineStore } from "pinia";
import { Api } from "~/api";
import { AxiosError } from "axios";
import { ConfigState } from "./config.types";

export const useConfigStore = defineStore("config", {
  state: (): ConfigState => ({
    typeList: [],
    reactionList: [],
    showList: [],
    rawg: [],
    imdb: [],
    isFetched: false,
    isFetching: false,
  }),
  actions: {
    async getConfig() {
      try {
        this.isFetching = true;
        const res = await Api<Omit<ConfigState, "isFetching">>(`/config`);
        if (!res) return;

        this.typeList = res.typeList;
        this.reactionList = res.reactionList;
        this.showList = res.showList;
        this.rawg = res.rawg;
        this.imdb = res.imdb;

        this.isFetched = true;
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
        const res = await Api(`/config/updateTable`, {
          method: "post",
        });

        if (!res) return;

        this.$message.add({
          severity: "success",
          summary: "Таблица конфига успешно обновлена",
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
