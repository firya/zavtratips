import { defineComponent, computed, watch } from "vue";
import { useField } from "vee-validate";
import Dropdown, { DropdownChangeEvent } from "primevue/dropdown";
import { useRecommendationsStore } from "~/stores";

export const RecommendationField = defineComponent({
  name: "RecommendationField",
  props: {
    name: {
      type: String,
      required: true,
    },
    podcast: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const { value, errorMessage, handleChange } = useField<number>(
      () => props.name,
    );
    const recommendationsStore = useRecommendationsStore();

    const isLoading = computed(() => recommendationsStore.isFetching);
    const options = computed(() => {
      return recommendationsStore.list.map((item, index) => ({
        label: `${item.type} — ${item.title}`,
        value: index,
      }));
    });

    const updateRecommendationList = async (podcast: string) => {
      recommendationsStore.setPodcast(podcast);
      await recommendationsStore.getRecommendations();

      if (!recommendationsStore.list.length) return;
      recommendationsStore.setCurrent(0);
      handleChange(0);
    };

    const changeHandler = ({ value }: DropdownChangeEvent) => {
      recommendationsStore.setCurrent(value);
    };

    updateRecommendationList(props.podcast);

    watch(
      () => props.podcast,
      async () => {
        await updateRecommendationList(props.podcast);
      },
      { immediate: true },
    );

    return {
      value,
      options,
      errorMessage,
      isLoading,
      changeHandler,
    };
  },
  render() {
    return (
      <div>
        <label>Рекомендация</label>
        <Dropdown
          class={"w-100"}
          panelClass={"dropdown"}
          v-model={this.value}
          optionValue={"value"}
          optionLabel={"label"}
          options={this.options}
          loading={this.isLoading}
          // @ts-expect-error primevue not ready for jsx
          onChange={this.changeHandler}
        />
        {this.errorMessage ? (
          <span class={"errorText"}>{this.errorMessage}</span>
        ) : null}
      </div>
    );
  },
});
