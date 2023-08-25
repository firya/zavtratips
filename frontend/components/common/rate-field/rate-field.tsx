import { computed, defineComponent, watch } from "vue";
import { useField } from "vee-validate";
import SelectButton, { SelectButtonChangeEvent } from "primevue/selectbutton";
import { useConfigStore } from "~/stores/config/config";
import { useRecommendationsStore } from "~/stores";
import styles from "./rate-field.module.css";
import { RecommendationItem } from "~/stores/recommendations/recommendations.types";

const emptyValue = "🚫";

export const RateField = defineComponent({
  name: "RateField",
  props: {
    name: {
      type: String,
      required: true,
    },
    label: {
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

    const options = computed(() => [emptyValue, ...configStore.reactionList]);

    const viewValue = computed(() =>
      value.value === "" ? emptyValue : value.value,
    );

    const changeHandler = ({ value }: SelectButtonChangeEvent) => {
      handleChange(value === emptyValue ? "" : value);
    };

    const updateConfig = async () => {
      if (!configStore.reactionList.length) await configStore.getConfig();

      handleChange("");
    };

    updateConfig();

    watch(
      () => recommendationsStore.current,
      () => {
        if (recommendationsStore.current === null) return;

        handleChange(
          props.name
            ? recommendationsStore.list[recommendationsStore.current][
                props.name as keyof RecommendationItem
              ] || ""
            : "",
        );
      },
      {
        immediate: true,
        deep: true,
      },
    );

    return {
      viewValue,
      options,
      errorMessage,
      handleChange,
      changeHandler,
    };
  },
  render() {
    return (
      <div class={styles.wrapper}>
        {this.label ? <label>{this.label}</label> : null}
        <SelectButton
          v-model={this.viewValue}
          options={this.options}
          class={styles.radio}
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
