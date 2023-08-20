import { defineComponent } from "vue";
import { MainComponent } from "~/components/pages/main/main";

export default defineComponent({
  name: "MainPage",
  setup() {
    return () => <MainComponent />;
  },
});
