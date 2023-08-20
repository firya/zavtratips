import { defineComponent } from "vue";
import { EditPodcastComponent } from "~/components/pages/podcasts";

export default defineComponent({
  name: "EditPodcastsPage",
  setup() {
    return () => <EditPodcastComponent />;
  },
});
