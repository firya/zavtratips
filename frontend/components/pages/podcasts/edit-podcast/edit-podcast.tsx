import { defineComponent } from "vue";
import { PodcastFormComponent } from "~/components/pages/podcasts";

export const EditPodcastComponent = defineComponent({
  name: "EditPodcastComponent",
  setup() {
    return () => <PodcastFormComponent />;
  },
});
