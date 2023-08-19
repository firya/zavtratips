import { defineComponent } from "vue";
import { PodcastsComponent } from "~/components/pages/podcasts";

export default defineComponent({
  name: "PodcastsPage",
  setup() {
    return () => <PodcastsComponent />;
  },
});
