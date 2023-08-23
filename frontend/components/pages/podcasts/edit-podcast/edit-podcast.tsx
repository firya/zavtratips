import { defineComponent } from "vue";
import {
  PodcastFormComponent,
  PodcastFormProps,
} from "~/components/pages/podcasts";
import { usePodcastsStore } from "~/stores";

export const EditPodcastComponent = defineComponent({
  name: "EditPodcastComponent",
  setup() {
    const podcastStore = usePodcastsStore();

    const submitHandler = async (values: PodcastFormProps) => {
      if (!values.row) return;

      await podcastStore.updatePodcasts(values.row, {
        date: values.date,
        podcast: values.show,
        number: values.number,
        title: values.title,
        length: values.length,
      });
    };

    const removeHandler = async (row: number) => {
      return await podcastStore.removePodcast(row);
    };

    return () => (
      <PodcastFormComponent
        edit={true}
        whenSubmit={submitHandler}
        whenRemove={removeHandler}
      />
    );
  },
});
