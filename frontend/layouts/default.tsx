import { defineComponent } from "vue";
import Toast from "primevue/toast";
import styles from "./default.module.css";
import { computed, useRoute, useRouter } from "#imports";
import Button from "primevue/button";
import { useConfigStore } from "~/stores/config/config";

export default defineComponent({
  name: "DefaultLayout",
  setup() {
    const $route = useRoute();
    const $router = useRouter();

    const configStore = useConfigStore();

    const showBack = computed(() => $route.path !== "/");
    const isSettings = computed(() => $route.path === "/settings");

    const backHandler = () => {
      const path = $route.path.split("/").filter(Boolean);
      $router.push("/" + path.slice(0, -1).join("/"));
    };
    const settingsHandler = () => {
      $router.push("/settings");
    };

    configStore.getConfig();

    return { settingsHandler, backHandler, showBack, isSettings };
  },
  render() {
    return (
      <div class={styles.layout}>
        <div class={styles.header}>
          {this.showBack ? (
            <Button
              text
              icon="pi pi-arrow-left"
              class={styles.back}
              onClick={this.backHandler}
            />
          ) : (
            <div class={styles.emptyBlock}></div>
          )}
          <div class={styles.title}>Zavtratips WebApp</div>
          {!this.isSettings ? (
            <Button
              text
              icon="pi pi-cog"
              class={styles.back}
              onClick={this.settingsHandler}
            />
          ) : (
            <div class={styles.emptyBlock}></div>
          )}
        </div>
        <div class={styles.content}>{this.$slots.default?.()}</div>
        <Toast />
      </div>
    );
  },
});
