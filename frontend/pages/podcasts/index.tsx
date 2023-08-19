import { defineComponent } from "vue";
import * as naive from "naive-ui";
import { usePodcastsStore } from "~/stores/podcasts/podcasts";

export default defineComponent({
  name: "PodcastsPage",
  setup() {
    const podcastsStore = usePodcastsStore();

    const clickHandler = () => {
      podcastsStore.getPodcasts();
    };

    return () => (
      <div>
        <naive.NButton onClick={clickHandler}>
          {process.env.HOST_URL || "test"}
        </naive.NButton>
      </div>
    );
  },
});
