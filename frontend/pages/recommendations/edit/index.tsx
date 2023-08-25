import { defineComponent } from "vue";
import { EditRecommendationsComponent } from "~/components/pages/recommendations";
import { definePageMeta } from "#imports";

definePageMeta({
  subtitle: "Edit recommendation",
});

export default defineComponent({
  name: "EditRecommendationsPage",
  setup() {
    return () => <EditRecommendationsComponent />;
  },
});
