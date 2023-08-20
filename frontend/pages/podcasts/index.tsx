import { defineComponent } from "vue";
import { PodcastsComponent } from "~/components/pages/podcasts/podcasts";

export default defineComponent({
  name: "PodcastsPage",
  setup() {
    return () => <PodcastsComponent />;
  },
});
