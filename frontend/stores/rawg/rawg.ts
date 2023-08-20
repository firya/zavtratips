import { defineStore } from "pinia";
import { Api } from "~/api";
import { AxiosError } from "axios";

import { RawgState, RawgItem } from "./rawg.types";

export const useRawgStore = defineStore("rawg", {
  state: (): RawgState => ({
    list: [],
    current: null,
    isFetching: false,
  }),
  actions: {
    setCurrent(value: RawgState["current"]) {
      this.current = value;
    },
    async getRawg(query: string) {
      this.isFetching = true;
      this.current = null;
      try {
        const res = await Api<RawgItem[]>(`/rawg`, {
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
