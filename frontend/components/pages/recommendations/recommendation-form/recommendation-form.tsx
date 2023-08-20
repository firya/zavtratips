import { defineComponent, ref, PropType } from "vue";
import { useForm } from "vee-validate";
import { object, string } from "yup";

import styles from "./recommendation-form.module.css";
import Button from "primevue/button";
import {
  PodcastField,
  RecommendationField,
  TypeField,
  AutocompleteTitleField,
} from "~/components/common";

export type PodcastFormProps = {
  podcast: string;
  recommendation: string;
  type: string;
};

const defaultForm = (): PodcastFormProps => ({
  podcast: "",
  recommendation: "",
  type: "",
});

export const RecommendationFormComponent = defineComponent({
  name: "RecommendationFormComponent",
  props: {
    defaultData: {
      type: Object as PropType<PodcastFormProps>,
    },
  },
  setup() {
    const schema = ref(
      object({
        podcast: string().required("Заполните поле"),
      }),
    );
    const { values, resetForm, isSubmitting, handleSubmit } =
      useForm<PodcastFormProps>({
        initialValues: defaultForm(),
        validationSchema: schema,
      });

    const submitHandler = handleSubmit(async (values) => {
      console.log(values);
    });

    const resetHandler = () => {
      resetForm();
    };

    return () => (
      <div class={styles.form}>
        <PodcastField name={"podcast"} />
        <RecommendationField name={"recommendation"} podcast={values.podcast} />
        {/*<TextField name={"test"} label={"test"} />*/}
        <TypeField name={"type"} />
        <AutocompleteTitleField name={"title"} type={values.type} />
        <div class={styles.actions}>
          <Button
            severity={"Primary"}
            loading={isSubmitting.value}
            class={styles.button}
            onClick={submitHandler}
          >
            Сохранить
          </Button>
          <Button
            severity={"Primary"}
            outlined
            class={styles.button}
            onClick={resetHandler}
          >
            Сбросить
          </Button>
        </div>
      </div>
    );
  },
});
