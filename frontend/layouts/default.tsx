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
    const handleBack = () => {
      const path = $route.path.split("/").filter(Boolean);
      $router.push("/" + path.slice(0, -1).join("/"));
    };

    configStore.getConfig();

    return { handleBack, showBack };
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
              onClick={this.handleBack}
            />
          ) : null}
          <div class={styles.title}>Zavtratips WebApp</div>
          {this.showBack ? <div class={styles.back}></div> : null}
        </div>
        <div class={styles.content}>{this.$slots.default?.()}</div>
        <Toast />
      </div>
    );
  },
});
