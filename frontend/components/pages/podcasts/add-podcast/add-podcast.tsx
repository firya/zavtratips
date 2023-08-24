import { defineComponent } from "vue";
import {
  PodcastFormComponent,
  PodcastFormProps,
} from "~/components/pages/podcasts";
import { usePodcastsStore } from "~/stores";

export const AddPodcastComponent = defineComponent({
  name: "AddPodcastComponent",
  setup() {
    const podcastStore = usePodcastsStore();
    const submitHandler = async (values: PodcastFormProps) => {
      return await podcastStore.addPodcasts({
        date: values.date,
        podcast: values.show,
        number: values.number,
        title: values.title,
        length: values.length,
      });
    };
    return () => (
      <PodcastFormComponent edit={false} whenSubmit={submitHandler} />
    );
  },
});
