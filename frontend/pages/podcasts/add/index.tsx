import { defineComponent } from "vue";
import { AddPodcastComponent } from "~/components/pages/podcasts";

import { definePageMeta } from "#imports";

definePageMeta({
  subtitle: "Add podcast",
});

export default defineComponent({
  name: "AddPodcastsPage",
  setup() {
    return () => <AddPodcastComponent />;
  },
});
