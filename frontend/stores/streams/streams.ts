import { defineStore } from "pinia";
import { Api } from "~/api";
import { AxiosError } from "axios";
import { StreamsState } from "~/stores/streams/streams.types";

export const useStreamsStore = defineStore("streams", {
  state: (): StreamsState => ({
    isFetching: false,
  }),
  actions: {
    async updateTable() {
      this.isFetching = true;
      try {
        const res = await Api(`/streams/updateTable`, {
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
