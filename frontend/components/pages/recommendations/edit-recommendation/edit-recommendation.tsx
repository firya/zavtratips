import { defineComponent } from "vue";
import { RecommendationFormComponent } from "~/components/pages/recommendations";

export const EditRecommendationsComponent = defineComponent({
  name: "EditRecommendationsComponent",
  setup() {
    return () => <RecommendationFormComponent />;
  },
});
