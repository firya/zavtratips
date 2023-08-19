import { defineComponent } from "vue";
import { NButton } from "naive-ui";
import { usePodcastsStore } from "~/stores/podcasts/podcasts";

export const PodcastsComponent = defineComponent({
  name: "PodcastsComponent",
  setup() {
    const podcastsStore = usePodcastsStore();

    const clickHandler = () => {
      podcastsStore.getPodcasts();
    };

    return () => (
      <div>
        <NButton type={"primary"} onClick={clickHandler}>
          test
        </NButton>
      </div>
    );
  },
});
