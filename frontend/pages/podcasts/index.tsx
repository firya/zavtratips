import { defineComponent } from "vue";
import { NButton } from "naive-ui";
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
        <NButton onClick={clickHandler}>test</NButton>
      </div>
    );
  },
});
