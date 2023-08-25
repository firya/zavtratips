import { defineComponent } from "vue";

import { SettingsComponent } from "~/components/pages/settings/settings";

export default defineComponent({
  name: "SettingsPage",
  setup() {
    return () => <SettingsComponent />;
  },
});
