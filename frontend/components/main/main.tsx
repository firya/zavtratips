import { defineComponent } from "vue";
import { NSpace, NButton } from "naive-ui";

import styles from "./main.module.css";

export const MainComponent = defineComponent({
  name: "MainComponent",
  setup() {
    const $router = useRouter();

    const menuClickHandler = (path: string) => {
      console.log($router.push(path));
    };

    return () => (
      <NSpace vertical>
        <NButton
          type={"primary"}
          class={styles.button}
          onClick={() => menuClickHandler("/podcasts")}
        >
          🎤 Podcasts
        </NButton>
        <NButton
          type={"info"}
          class={styles.button}
          onClick={() => menuClickHandler("/recommendations")}
        >
          🤔 Recommendations
        </NButton>
      </NSpace>
    );
  },
});
