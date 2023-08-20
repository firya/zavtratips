import { defineComponent } from "vue";
import { useField } from "vee-validate";
import InputText from "primevue/inputtext";

export const TextField = defineComponent({
  name: "TextField",
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

    return {
      value,
      errorMessage,
      handleChange,
    };
  },
  render() {
    return (
      <div>
        {this.label ? <label>{this.label}</label> : null}
        <InputText v-model={this.value} />
        {this.errorMessage ? (
          <span class={"errorText"}>{this.errorMessage}</span>
        ) : null}
      </div>
    );
  },
});
