import { defineComponent } from "vue";
import Button from "primevue/button";
import styles from "./main.module.css";
import { useRouter } from "#imports";
import { usePodcastsStore } from "~/stores";

export const MainComponent = defineComponent({
  name: "MainComponent",
  setup() {
    const $router = useRouter();

    const menuClickHandler = (path: string) => {
      $router.push(path);
    };

    return () => (
      <div class={styles.wrapper}>
        <Button
          severity={"success"}
          class={styles.button}
          onClick={() => menuClickHandler("/podcasts")}
        >
          🎤 Podcasts
        </Button>
        <Button
          severity={"primary"}
          class={styles.button}
          onClick={() => menuClickHandler("/recommendations")}
        >
          🤔 Recommendations
        </Button>
      </div>
    );
  },
});
