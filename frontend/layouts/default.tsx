import { defineComponent } from "vue";
import { NPageHeader, NLayout, NLayoutHeader, NLayoutContent } from "naive-ui";

import styles from "./default.module.css";

export default defineComponent({
  name: "DefaultLayout",
  setup() {
    const $route = useRoute();
    const $router = useRouter();

    const showBack = computed(() => $route.path !== "/");
    const handleBack = () => {
      $router.back();
    };
    return { handleBack, showBack };
  },
  render() {
    return (
      <NLayout class={styles.layout}>
        <NLayoutHeader class={styles.header}>
          <NPageHeader
            title={"Zavtratips WebApp"}
            onBack={this.showBack ? this.handleBack : undefined}
          />
        </NLayoutHeader>
        <NLayoutContent content-style="padding: 1em 2em;">
          {this.$slots.default?.()}
        </NLayoutContent>
      </NLayout>
    );
  },
});
