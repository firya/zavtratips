import { defineStore } from "pinia";
import { PodcastsState } from "~/stores/podcasts/podcasts.types";
import { Api } from "~/api";

export const usePodcastsStore = defineStore("podcasts", {
  state: (): PodcastsState => ({
    page: 1,
    pageSize: 20,
    list: [],
  }),
  actions: {
    async getPodcasts() {
      const res = await Api("/podcasts", {
        params: {
          page: this.page,
          pageSize: this.pageSize,
        },
      });
      console.log(res);
    },
  },
});
