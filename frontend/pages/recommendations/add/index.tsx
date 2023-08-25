import { defineComponent } from "vue";
import { AddRecommendationsComponent } from "~/components/pages/recommendations";
import { definePageMeta } from "#imports";

definePageMeta({
  subtitle: "Add recommendation",
});

export default defineComponent({
  name: "AddRecommendationsPage",
  setup() {
    return () => <AddRecommendationsComponent />;
  },
});
