import { defineComponent, computed, watch } from "vue";
import { useField } from "vee-validate";
import AutoComplete, {
  AutoCompleteCompleteEvent,
  AutoCompleteChangeEvent,
} from "primevue/autocomplete";
import { useDebounceFn } from "@vueuse/core";
import { useConfigStore } from "~/stores/config/config";
import { useImdbStore } from "~/stores/imdb/imdb";
import { useRawgStore } from "~/stores/rawg/rawg";
import { useRecommendationsStore } from "~/stores";
import { splitName } from "~/utils/string";

type OptionType = {
  label: string;
  year: string;
  value: number;
};

export const AutocompleteTitleField = defineComponent({
  name: "AutocompleteTitleField",
  props: {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const { value, errorMessage, handleChange } = useField<string>(
      () => props.name,
    );
    const configStore = useConfigStore();
    const recommendationsStore = useRecommendationsStore();
    const imdbStore = useImdbStore();
    const rawgStore = useRawgStore();
    const isLoading = computed(
      () => imdbStore.isFetching || rawgStore.isFetching,
    );

    const activeStore = computed(() => {
      if (configStore.imdb.includes(props.type)) {
        return imdbStore;
      }
      if (configStore.rawg.includes(props.type)) {
        return rawgStore;
      }

      return null;
    });

    const options = computed(() => {
      if (!activeStore.value) return [];

      return activeStore.value.list.map<OptionType>((item, index) => ({
        label: item.title,
        year: item.year,
        value: index,
      }));
    });

    const searchHandler = useDebounceFn(async (value: string) => {
      if (configStore.imdb.includes(props.type)) {
        await imdbStore.getImdb(value);
      } else if (configStore.rawg.includes(props.type)) {
        await rawgStore.getRawg(value);
      }
    }, 500);

    const inputHandler = async ({ query }: AutoCompleteCompleteEvent) => {
      searchHandler(query);
    };

    const changeHandler = async ({ value }: AutoCompleteChangeEvent) => {
      if (!activeStore.value) return;
      activeStore.value.setCurrent(value.value);
    };

    const init = async () => {
      await configStore.getConfig();
    };
    init();

    watch(
      () => recommendationsStore.current,
      () => {
        if (recommendationsStore.current === null) return;

        const { name } = splitName(
          recommendationsStore.list[recommendationsStore.current].title,
        );

        handleChange(name);
      },
      {
        immediate: true,
        deep: true,
      },
    );

    return {
      options,
      value,
      inputHandler,
      errorMessage,
      isLoading,
      changeHandler,
    };
  },
  render() {
    return (
      <div>
        <label>Название</label>
        <AutoComplete
          class={"w-100"}
          inputClass={"w-100"}
          suggestions={this.options}
          v-model={this.value}
          optionLabel={"label"}
          loading={this.isLoading}
          // @ts-expect-error primevue not ready for jsx
          onComplete={this.inputHandler}
          onChange={this.changeHandler}
        >
          {{
            option: ({ option }: { option: OptionType }) => (
              <div>{`${option.label} (${option.year})`}</div>
            ),
          }}
        </AutoComplete>
        {this.errorMessage ? (
          <span class={"errorText"}>{this.errorMessage}</span>
        ) : null}
      </div>
    );
  },
});
