import { defineComponent, ref, watch } from "vue";
import { useForm } from "vee-validate";
import { object, string } from "yup";

import styles from "./podcast-form.module.css";
import Button from "primevue/button";
import { PodcastField, TextField } from "~/components/common";
import { ShowField } from "~/components/common/show-field/show-field";
import { usePodcastsStore } from "~/stores";
import { DateField } from "~/components/common/date-field/date-field";
import { onBeforeUnmount, useRouter } from "#imports";

export type PodcastFormProps = {
  row?: number;
  podcast: string;
  date: Date | null;
  show: string;
  number: string;
  title: string;
  length: string;
};

const defaultForm = (): PodcastFormProps => ({
  podcast: "",
  date: null,
  show: "",
  number: "",
  title: "",
  length: "",
});

export const PodcastFormComponent = defineComponent({
  name: "PodcastFormComponent",
  props: {
    edit: {
      type: Boolean,
      required: true,
    },
    whenSubmit: {
      type: Function,
      required: true,
    },
    whenRemove: {
      type: Function,
    },
  },
  setup({ edit, whenSubmit, whenRemove }) {
    const $router = useRouter();
    const podcastStore = usePodcastsStore();

    const schema = ref(
      object({
        number: string().required("Заполните поле"),
      }),
    );
    const { resetField, isSubmitting, handleSubmit } =
      useForm<PodcastFormProps>({
        initialValues: defaultForm(),
        validationSchema: schema,
      });

    const submitHandler = handleSubmit(async (values) => {
      const row =
        podcastStore.current !== null
          ? podcastStore.list[podcastStore.current].row
          : undefined;

      values.date = values.date
        ? new Date(
            values.date.getTime() - values.date.getTimezoneOffset() * 60000,
          )
        : null;

      const res = await whenSubmit({
        ...values,
        row: row,
      });

      if (!res) return;
      resetField("date");
      resetField("number");
      resetField("title");
      resetField("length");
    });

    const removeHandler = async () => {
      const row =
        podcastStore.current !== null
          ? podcastStore.list[podcastStore.current].row
          : undefined;

      if (!row || !whenRemove) return;

      await whenRemove(row);
      $router.back();
    };

    const updateData = () => {
      if (podcastStore.current === null) return;

      const { date, podcast, number, title, length } =
        podcastStore.list[podcastStore.current];

      resetField("date", { value: date });
      resetField("show", { value: podcast });
      resetField("number", { value: number });
      resetField("title", { value: title });
      resetField("length", { value: length });
    };

    updateData();

    watch(() => podcastStore.current, updateData, {
      immediate: true,
      deep: true,
    });

    onBeforeUnmount(() => {
      podcastStore.$reset();
    });

    return () => (
      <div class={styles.form}>
        {edit && <PodcastField name={"podcast"} />}
        <ShowField name={"show"} />
        <TextField name={"number"} label={"Номер"} />
        <TextField name={"title"} label={"Заголовок"} />
        <DateField name={"date"} label={"Дата выхода"} />
        <TextField name={"length"} label={"Продолжительность (hh:mm:ss)"} />
        <div class={styles.actions}>
          <Button
            severity={"Primary"}
            loading={isSubmitting.value}
            class={styles.button}
            onClick={submitHandler}
          >
            Сохранить
          </Button>
          {edit && whenRemove && (
            <Button
              severity={"danger"}
              outlined
              class={styles.button}
              onClick={removeHandler}
            >
              Удалить
            </Button>
          )}
        </div>
      </div>
    );
  },
});
