import { defineComponent } from "vue";
import { AddPodcastComponent } from "~/components/pages/podcasts";

export default defineComponent({
  name: "AddPodcastsPage",
  setup() {
    return () => <AddPodcastComponent />;
  },
});
