import { defineComponent } from "vue";
import {EditRecommendationsComponent} from "~/components/pages/recommendations";

export default defineComponent({
  name: "EditRecommendationsPage",
  setup() {
    return () => <EditRecommendationsComponent />;
  },
});
