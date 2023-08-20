import { defineComponent } from "vue";
import { PodcastFormComponent } from "~/components/pages/podcasts";

export const AddPodcastComponent = defineComponent({
  name: "AddPodcastComponent",
  setup() {
    return () => <PodcastFormComponent />;
  },
});
