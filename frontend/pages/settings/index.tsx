import { defineComponent } from "vue";
import { SettingsComponent } from "~/components/pages/settings/settings";
import { definePageMeta } from "#imports";

definePageMeta({
  subtitle: "Settings",
});

export default defineComponent({
  name: "SettingsPage",
  setup() {
    return () => <SettingsComponent />;
  },
});
