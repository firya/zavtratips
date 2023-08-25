import { defineComponent } from "vue";

import { RecommendationsComponent } from "~/components/pages/recommendations";
import { definePageMeta } from "#imports";

definePageMeta({
  subtitle: "Recommendations",
});

export default defineComponent({
  name: "RecommendationsPage",
  setup() {
    return () => <RecommendationsComponent />;
  },
});
