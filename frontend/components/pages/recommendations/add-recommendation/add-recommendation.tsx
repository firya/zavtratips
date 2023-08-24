import { defineComponent } from "vue";
import {
  PodcastFormProps,
  RecommendationFormComponent,
} from "~/components/pages/recommendations";
import { useRecommendationsStore } from "~/stores";

export const AddRecommendationsComponent = defineComponent({
  name: "AddRecommendationsComponent",
  setup() {
    const recommendationStore = useRecommendationsStore();

    const submitHandler = async (values: PodcastFormProps) => {
      return await recommendationStore.addRecommendation(values);
    };

    return () => (
      <RecommendationFormComponent edit={false} whenSubmit={submitHandler} />
    );
  },
});
