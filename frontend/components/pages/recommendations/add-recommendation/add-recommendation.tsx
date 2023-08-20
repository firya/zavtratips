import { defineComponent } from "vue";
import { RecommendationFormComponent } from "~/components/pages/recommendations";

export const AddRecommendationsComponent = defineComponent({
  name: "AddRecommendationsComponent",
  setup() {
    return () => <RecommendationFormComponent />;
  },
});
