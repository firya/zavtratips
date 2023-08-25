import { defineComponent } from "vue";
import { PodcastsComponent } from "~/components/pages/podcasts/podcasts";
import { definePageMeta } from "#imports";

definePageMeta({
  subtitle: "Podcasts",
});

export default defineComponent({
  name: "PodcastsPage",
  setup() {
    return () => <PodcastsComponent />;
  },
});
