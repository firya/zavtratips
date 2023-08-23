import { defineComponent } from "vue";
import { useField } from "vee-validate";
import Calendar from "primevue/calendar";

export const DateField = defineComponent({
  name: "DateField",
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
    const { value, errorMessage } = useField<string>(() => props.name);

    return {
      errorMessage,
      value,
    };
  },
  render() {
    return (
      <div>
        {this.label ? <label>{this.label}</label> : null}
        <Calendar
          class={"w-100"}
          v-model={this.value}
          dateFormat={"dd.mm.yy"}
        />
        {this.errorMessage ? (
          <span class={"errorText"}>{this.errorMessage}</span>
        ) : null}
      </div>
    );
  },
});
