import { defineComponent } from "vue";
import Button from "primevue/button";
import { useRoute, useRouter } from "#imports";
import styles from "./recommendations.module.css";

export const RecommendationsComponent = defineComponent({
  name: "RecommendationsComponent",
  setup() {
    const $router = useRouter();
    const $route = useRoute();

    const menuClickHandler = (path: string) => {
      $router.push($route.path + path);
    };

    return () => (
      <div class={styles.wrapper}>
        <Button
          severity={"Primary"}
          class={styles.button}
          onClick={() => menuClickHandler("/add")}
        >
          ✨ Create Recommendation
        </Button>

        <Button
          severity={"Primary"}
          outlined
          class={styles.button}
          onClick={() => menuClickHandler("/edit")}
        >
          ✏️ Edit Recommendation
        </Button>
      </div>
    );
  },
});
