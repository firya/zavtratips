import { defineComponent } from "vue";
import {AddRecommendationsComponent} from "~/components/pages/recommendations";

export default defineComponent({
  name: "AddRecommendationsPage",
  setup() {
    return () => <AddRecommendationsComponent />;
  },
});
