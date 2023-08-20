import { defineComponent } from "vue";
import styles from "./podcasts.module.css";
import Button from "primevue/button";
import { useRoute, useRouter } from "#imports";

export const PodcastsComponent = defineComponent({
  name: "PodcastsComponent",
  setup() {
    const $router = useRouter();
    const $route = useRoute();

    const menuClickHandler = (path: string) => {
      $router.push($route.path + path);
    };

    return () => (
      <div class={styles.wrapper}>
        <Button
          severity={"success"}
          class={styles.button}
          onClick={() => menuClickHandler("/add")}
        >
          ✨ Create Podcast
        </Button>

        <Button
          severity={"success"}
          outlined
          class={styles.button}
          onClick={() => menuClickHandler("/edit")}
        >
          ✏️ Edit Podcast
        </Button>
      </div>
    );
  },
});
