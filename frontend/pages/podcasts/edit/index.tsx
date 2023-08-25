import { defineComponent } from "vue";
import { EditPodcastComponent } from "~/components/pages/podcasts";

import { definePageMeta } from "#imports";

definePageMeta({
  subtitle: "Edit podcast",
});

export default defineComponent({
  name: "EditPodcastsPage",
  setup() {
    return () => <EditPodcastComponent />;
  },
});
