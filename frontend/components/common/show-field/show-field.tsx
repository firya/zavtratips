import { defineComponent, computed, watch } from "vue";
import { useField } from "vee-validate";
import Dropdown from "primevue/dropdown";
import { useConfigStore } from "~/stores/config/config";
import { useRecommendationsStore } from "~/stores";

export const ShowField = defineComponent({
  name: "ShowField",
  props: {
    name: {
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

    const isLoading = computed(() => configStore.isFetching);
    const options = computed(() => {
      return configStore.showList.map((item) => ({
        label: item,
        value: item,
      }));
    });

    const updateConfig = async () => {
      if (!configStore.showList.length) await configStore.getConfig();

      handleChange(configStore.showList[0]);
    };

    updateConfig();

    watch(
      () => recommendationsStore.current,
      () => {
        if (recommendationsStore.current === null) return;

        handleChange(
          recommendationsStore.list[recommendationsStore.current].type,
        );
      },
      {
        immediate: true,
        deep: true,
      },
    );

    return {
      options,
      errorMessage,
      isLoading,
      value,
    };
  },
  render() {
    return (
      <div>
        <label>Шоу</label>
        <Dropdown
          class={"w-100"}
          v-model={this.value}
          optionValue={"value"}
          optionLabel={"label"}
          options={this.options}
          loading={this.isLoading}
        />
        {this.errorMessage ? (
          <span class={"errorText"}>{this.errorMessage}</span>
        ) : null}
      </div>
    );
  },
});
