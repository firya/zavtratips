import { defineComponent } from "vue";
import {
  PodcastFormProps,
  RecommendationFormComponent,
} from "~/components/pages/recommendations";
import { useRecommendationsStore } from "~/stores";

export const EditRecommendationsComponent = defineComponent({
  name: "EditRecommendationsComponent",
  setup() {
    const recommendationStore = useRecommendationsStore();

    const submitHandler = async (values: PodcastFormProps) => {
      if (!values.row) return;

      await recommendationStore.updateRecommendation(values.row, values);
    };
    const removeHandler = async (row: number) => {
      return await recommendationStore.removeRecommendation(row);
    };
    return () => (
      <RecommendationFormComponent
        edit={true}
        whenSubmit={submitHandler}
        whenRemove={removeHandler}
      />
    );
  },
});
