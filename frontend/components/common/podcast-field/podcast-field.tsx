import { defineComponent, computed } from "vue";
import { useField } from "vee-validate";
import AutoComplete, { AutoCompleteCompleteEvent } from "primevue/autocomplete";
import { usePodcastsStore } from "~/stores";
import { useDebounceFn } from "@vueuse/core";

export const PodcastField = defineComponent({
  name: "PodcastField",
  props: {
    name: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const { value, errorMessage, setValue } = useField<string>(
      () => props.name,
    );
    const podcastStore = usePodcastsStore();
    const isLoading = computed(() => podcastStore.isFetching);

    const options = computed(() => {
      return podcastStore.list.map((item) => item.podcastnumber);
    });

    const inputHandler = async ({ query }: AutoCompleteCompleteEvent) => {
      podcastStore.setQuery(query);
      searchPodcastHandler();
    };

    const searchPodcastHandler = useDebounceFn(async () => {
      await podcastStore.getPodcasts();
    }, 500);

    const setDefaultValue = async () => {
      await searchPodcastHandler();
      const firstElement = podcastStore.list[0];
      if (!firstElement) return;
      setValue(firstElement.podcastnumber);
    };

    setDefaultValue();

    return {
      options,
      inputHandler,
      errorMessage,
      isLoading,
      value,
    };
  },
  render() {
    return (
      <div>
        <label>Подкаст</label>
        <AutoComplete
          class={"w-100"}
          inputClass={"w-100"}
          suggestions={this.options}
          v-model={this.value}
          loading={this.isLoading}
          // @ts-expect-error primevue not ready for jsx
          onComplete={this.inputHandler}
        />
        {this.errorMessage ? (
          <span class={"errorText"}>{this.errorMessage}</span>
        ) : null}
      </div>
    );
  },
});
