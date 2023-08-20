import { defineComponent } from "vue";

import { RecommendationsComponent } from "~/components/pages/recommendations";

export default defineComponent({
  name: "RecommendationsPage",
  setup() {
    return () => <RecommendationsComponent />;
  },
});
