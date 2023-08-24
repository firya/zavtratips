import { defineComponent, ref, watch } from "vue";
import { useForm } from "vee-validate";
import { object, string } from "yup";

import styles from "./recommendation-form.module.css";
import Button from "primevue/button";
import {
  PodcastField,
  RecommendationField,
  TypeField,
  AutocompleteTitleField,
  TextField,
} from "~/components/common";
import { DateField } from "~/components/common/date-field/date-field";
import { usePodcastsStore, useRecommendationsStore } from "~/stores";
import { combineTitle, splitTitle } from "~/utils/string";
import Accordion from "primevue/accordion";
import AccordionTab from "primevue/accordiontab";
import { RateField } from "~/components/common/rate-field/rate-field";
import { onBeforeUnmount, useRouter } from "#imports";
import { useImdbStore } from "~/stores/imdb/imdb";
import { useRawgStore } from "~/stores/rawg/rawg";
import { useConfigStore } from "~/stores/config/config";

export type PodcastFormProps = {
  row?: number;
  podcast: string;
  recommendation: string;
  type: string;
  title: string;
  anotherTitle: string;
  titleDescription: string;
  link: string;
  image: string;
  rating: string;
  platforms: string;
  genres: string;
  releasedate: string;
  length: string;
  dima: string;
  timur: string;
  maksim: string;
  guest: string;
};

const defaultForm = (): PodcastFormProps => ({
  podcast: "",
  recommendation: "",
  type: "",
  title: "",
  anotherTitle: "",
  titleDescription: "",
  link: "",
  image: "",
  rating: "",
  platforms: "",
  genres: "",
  releasedate: "",
  length: "",
  dima: "",
  timur: "",
  maksim: "",
  guest: "",
});

export const RecommendationFormComponent = defineComponent({
  name: "RecommendationFormComponent",
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
    const recommendationsStore = useRecommendationsStore();
    const podcastsStore = usePodcastsStore();
    const imdbStore = useImdbStore();
    const rawgStore = useRawgStore();
    const configStore = useConfigStore();

    const schema = ref(
      object({
        podcast: string().required("Заполните поле"),
        title: string().required("Заполните поле"),
      }),
    );
    const { values, isSubmitting, handleSubmit, resetField, resetForm } =
      useForm<PodcastFormProps>({
        initialValues: defaultForm(),
        validationSchema: schema,
      });

    const submitHandler = handleSubmit(async (values) => {
      const podcastDate =
        podcastsStore.current !== null
          ? podcastsStore.list[podcastsStore.current].date
          : undefined;
      const row =
        recommendationsStore.current !== null
          ? recommendationsStore.list[recommendationsStore.current].row
          : undefined;

      const { title, anotherTitle, titleDescription, ...data } = values;

      const combinedTitle = combineTitle({
        title,
        anotherTitle,
        titleDescription,
      });

      const res = await whenSubmit({
        ...data,
        date: podcastDate,
        title: combinedTitle,
        row: row,
      });

      if (!res) return;
      resetForm({ values: { podcast: values.podcast, type: values.type } });
    });

    const removeHandler = async () => {
      const row =
        recommendationsStore.current !== null
          ? recommendationsStore.list[recommendationsStore.current].row
          : undefined;

      if (!row || !whenRemove) return;

      await whenRemove(row);
      $router.back();
    };

    watch(
      () => recommendationsStore.current,
      () => {
        if (recommendationsStore.current === null) {
          return;
        }

        const data = recommendationsStore.list[recommendationsStore.current];

        resetField("anotherTitle", {
          value: splitTitle(data.title).anotherTitle,
        });
        resetField("titleDescription", {
          value: splitTitle(data.title).titleDescription,
        });
        resetField("link", {
          value: data.link,
        });
        resetField("image", {
          value: data.image,
        });
        resetField("rating", {
          value: data.rating,
        });
        resetField("platforms", {
          value: data.platforms,
        });
        resetField("genres", {
          value: data.genres,
        });
        resetField("releasedate", {
          value: data.releasedate ? new Date(data.releasedate) : null,
        });
        resetField("length", {
          value: data.length,
        });
        resetField("guest", {
          value: data.guest,
        });
      },
    );

    watch(
      () => [imdbStore.current, rawgStore.current],
      () => {
        const activeStore = configStore.imdb.includes(values.type)
          ? imdbStore
          : configStore.rawg.includes(values.type)
          ? rawgStore
          : null;
        if (!activeStore || activeStore.current === null) return;

        const data = activeStore.list[activeStore.current];

        resetField("link", {
          value: data.link,
        });
        resetField("image", {
          value: data.image,
        });
        resetField("rating", {
          value: data.rating,
        });
        resetField("platforms", {
          value: data.platforms,
        });
        resetField("genres", {
          value: data.genres,
        });
        resetField("releasedate", {
          value: data.releasedate ? new Date(data.releasedate) : null,
        });
        resetField("length", {
          value: data.length,
        });
      },
    );

    onBeforeUnmount(() => {
      recommendationsStore.$reset();
      podcastsStore.$reset();
      imdbStore.$reset();
      rawgStore.$reset();
    });

    return () => (
      <div class={styles.form}>
        <PodcastField name={"podcast"} />
        {edit && (
          <RecommendationField
            name={"recommendation"}
            podcast={values.podcast}
          />
        )}
        <TypeField name={"type"} />
        <AutocompleteTitleField name={"title"} type={values.type} />
        <TextField name={"anotherTitle"} label={"Другое название"} />
        <TextField name={"titleDescription"} label={"Описание (в скобках)"} />
        <TextField name={"link"} label={"Ссылка"} />
        <Accordion>
          <AccordionTab
            header="Показать дополнительные параметры"
            contentClass={styles.accordion}
          >
            <div class={styles.form}>
              <TextField name={"image"} label={"Изображение"} />
              <TextField name={"rating"} label={"Рейтинг"} />
              <TextField name={"platforms"} label={"Платформы"} />
              <TextField name={"genres"} label={"Жанр"} />
              <DateField name={"releasedate"} label={"Дата релиза"} />
              <TextField name={"length"} label={"Продолжительность"} />
            </div>
          </AccordionTab>
        </Accordion>
        <div class={styles.column}>
          <RateField name={"dima"} label={"Дима"} />
          <RateField name={"timur"} label={"Тимур"} />
          <RateField name={"maksim"} label={"Максим"} />
        </div>
        <TextField name={"guest"} label={"Гость"} />

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
