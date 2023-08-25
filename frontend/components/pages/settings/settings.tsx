import { defineComponent } from "vue";
import Button from "primevue/button";
import { usePodcastsStore, useRecommendationsStore } from "~/stores";
import styles from "./settings.module.css";
import { useConfigStore } from "~/stores/config/config";

export const SettingsComponent = defineComponent({
  name: "SettingsComponent",
  setup() {
    const podcastsStore = usePodcastsStore();
    const recommendationsStore = useRecommendationsStore();
    const configStore = useConfigStore();

    const updatePodcastsTable = async () => {
      await podcastsStore.updateTable();
    };
    const updateRecommendationsTable = async () => {
      await recommendationsStore.updateTable();
    };
    const updateConfigTable = async () => {
      await configStore.updateTable();
    };

    return () => (
      <div class={styles.wrapper}>
        <Button
          severity={"primary"}
          class={styles.button}
          loading={podcastsStore.isFetching}
          onClick={updatePodcastsTable}
        >
          🎤 Sync Pocasts Table
        </Button>
        <Button
          severity={"primary"}
          class={styles.button}
          loading={recommendationsStore.isFetching}
          onClick={updateRecommendationsTable}
        >
          🤔 Sync Recommendations Table
        </Button>
        <Button
          severity={"primary"}
          class={styles.button}
          loading={configStore.isFetching}
          onClick={updateConfigTable}
        >
          ⚙️ Sync Config Table
        </Button>
      </div>
    );
  },
});
