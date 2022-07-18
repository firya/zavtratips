import { useState, useEffect } from "react";
import { Form, Input, Button, Skeleton, notification } from "antd";
import API from "../../libs/api";
import { generateName, splitName } from "../../libs/utils";
import AutocompleteField from "../autocomplete";

const EditRecommendation = () => {
  const [form] = Form.useForm();

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingConfig, setLoadingConfig] = useState<boolean>(true);

  const [loadingPodcastList, setLoadingPodcastList] = useState<boolean>(true);
  const [podcastList, setPodcastList] = useState<any[]>([]);

  const [loadingRecommendationList, setLoadingRecommendationList] =
    useState<boolean>(false);
  const [recommendationList, setRecommendationList] = useState<any[]>([]);

  const [typeList, setTypeList] = useState<string[]>([]);
  const [reactionList, setReactionList] = useState<string[]>([]);

  useEffect(() => {
    loadConfig();
    loadPodcastList();
  }, []);

  useEffect(() => {
    if (podcastList.length > 0) {
      hendleChangePodcast(0);
    }
  }, [podcastList]);

  useEffect(() => {
    if (recommendationList.length > 0) {
      hendleChangeRecommendation(0);
    }
  }, [recommendationList]);

  const loadConfig = async () => {
    const result = await API({
      method: "GET",
      endpoint: "/config",
    });

    setTypeList(result.typeList);
    setReactionList(["", ...result.reactionList]);

    setLoadingConfig(false);
  };

  const loadPodcastList = async () => {
    const result = await API({
      method: "GET",
      endpoint: "/rows",
      data: {
        sheetTitle: "Выпуски",
        limit: 0,
        order: -1,
      },
    });

    setPodcastList(result);
    setLoadingPodcastList(false);
  };

  const loadRecommendationList = async (value: string) => {
    setLoadingRecommendationList(true);

    const result = await API({
      method: "GET",
      endpoint: "/rows",
      data: {
        sheetTitle: "Рекомендации",
        data: {
          Выпуск: value,
        },
        limit: 0,
        order: -1,
      },
    });

    setRecommendationList(result);
    setLoadingRecommendationList(false);
  };

  const onFinish = async (values: any) => {
    if (!loading) {
      setLoading(true);
      const rowNumber = recommendationList[values.recommendation].rowNumber;
      try {
        await API({
          method: "PUT",
          endpoint: `/rows/`,
          data: {
            dataCheckString: window.Telegram.WebApp.initData,
            sheetTitle: "Рекомендации",
            rowNumber: rowNumber,
            data: {
              Выпуск: podcastList[values.podcast].data["Шоу и номер"],
              Тип: values.type,
              Название: generateName(
                values.name,
                values.anothername,
                values.description
              ),
              Ссылка: values.link,
              Дима: values.dima,
              Тимур: values.timur,
              Максим: values.maksim,
              Гость: values.guest,
            },
          },
        });

        notification.open({
          message: "Recommendation changed",
          description: "",
          placement: "top",
        });
      } catch (e: any) {
        console.log(e);
        notification.open({
          message: e.error.message,
          description: "",
          placement: "top",
        });
      }

      setLoading(false);
    }
  };

  const hendleChangePodcast = (value: number) => {
    loadRecommendationList(podcastList[value].data["Шоу и номер"]);

    form.setFieldsValue({
      podcast: value,
    });
  };

  const hendleChangeRecommendation = (value: number) => {
    const splittedName = splitName(recommendationList[value].data["Название"]);

    form.setFieldsValue({
      recommendation: value,
      type: recommendationList[value].data["Тип"],
      link: recommendationList[value].data["Ссылка"],
      dima: recommendationList[value].data["Дима"],
      timur: recommendationList[value].data["Тимур"],
      maksim: recommendationList[value].data["Максим"],
      guest: recommendationList[value].data["Гость"],
      ...splittedName,
    });
  };

  return (
    <Form
      name="basic"
      initialValues={{ remember: true }}
      onFinish={onFinish}
      autoComplete="off"
      layout="vertical"
      form={form}
      style={{ padding: "24px" }}
    >
      <Form.Item
        label="Podcast"
        name="podcast"
        rules={[{ required: true, message: "Please choose type" }]}
      >
        <select
          style={{ width: "100%" }}
          onChange={(e) => hendleChangePodcast(+e.target.value)}
          tabIndex={0}
          className="select"
        >
          {podcastList.map((podcast, i) => (
            <option value={i} key={i}>
              {podcast.data["Шоу и номер"]}
            </option>
          ))}
        </select>
      </Form.Item>

      {loadingPodcastList && loadingConfig ? (
        <Skeleton active />
      ) : (
        <>
          <Form.Item
            label="Recommendation"
            name="recommendation"
            rules={[{ required: true, message: "Please choose type" }]}
          >
            <select
              style={{ width: "100%" }}
              onChange={(e) => hendleChangeRecommendation(+e.target.value)}
              className="select"
              tabIndex={1}
            >
              {recommendationList.map((recommendation, i) => (
                <option value={i} key={i}>
                  {recommendation.data["Тип"] +
                    ": " +
                    recommendation.data["Название"]}
                </option>
              ))}
            </select>
          </Form.Item>

          {loadingRecommendationList ? (
            <Skeleton active />
          ) : (
            <>
              <Form.Item label="Type" name="type" initialValue={typeList[0]}>
                <select className="select" tabIndex={2}>
                  {typeList.map((type, i) => (
                    <option value={type} key={i}>
                      {type}
                    </option>
                  ))}
                </select>
              </Form.Item>
              <AutocompleteField form={form} typeList={typeList} />
              <Form.Item label="Another name" name="anothername">
                <Input className="input" size="large" tabIndex={4} />
              </Form.Item>
              <Form.Item label="Description" name="description">
                <Input className="input" size="large" tabIndex={5} />
              </Form.Item>
              <Form.Item label="Link" name="link">
                <Input className="input" size="large" tabIndex={6} />
              </Form.Item>

              <Form.Item label="Dima" name="dima">
                <select className="select" tabIndex={8}>
                  {reactionList.map((emoji, i) => (
                    <option value={emoji} key={i}>
                      {emoji}
                    </option>
                  ))}
                </select>
              </Form.Item>

              <Form.Item label="Timur" name="timur">
                <select className="select" tabIndex={9}>
                  {reactionList.map((emoji, i) => (
                    <option value={emoji} key={i}>
                      {emoji}
                    </option>
                  ))}
                </select>
              </Form.Item>

              <Form.Item label="Maksim" name="maksim">
                <select className="select" tabIndex={10}>
                  {reactionList.map((emoji, i) => (
                    <option value={emoji} key={i}>
                      {emoji}
                    </option>
                  ))}
                </select>
              </Form.Item>
              <Form.Item label="Guest" name="guest">
                <Input className="input" size="large" tabIndex={11} />
              </Form.Item>
            </>
          )}
        </>
      )}
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

export default EditRecommendation;
