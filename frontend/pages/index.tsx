import { defineComponent } from "vue";
import { MainComponent } from "~/components/main/main";

export default defineComponent({
  name: "MainPage",
  setup() {
    return () => <MainComponent />;
  },
});
