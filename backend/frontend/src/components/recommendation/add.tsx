import { useState, useEffect } from "react";
import { Form, Button, Input, Skeleton, notification } from "antd";
import API from "../../libs/api";
import { generateName } from "../../libs/utils";
import AutocompleteField from "../autocomplete";

const AddRecommendation = () => {
  const [form] = Form.useForm();

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingPodcastList, setLoadingPodcastList] = useState<boolean>(true);
  const [loadingConfig, setLoadingConfig] = useState<boolean>(true);
  const [podcastList, setPodcastList] = useState<any[]>([]);
  const [typeList, setTypeList] = useState<string[]>([]);
  const [reactionList, setReactionList] = useState<string[]>([]);

  useEffect(() => {
    loadConfig();
    loadPodcastList();
  }, []);

  useEffect(() => {
    if (podcastList.length > 0) {
      form.setFieldsValue({
        podcast: 0,
      });
    }
  }, [podcastList]);

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

  const onFinish = async (values: any) => {
    if (!loading) {
      setLoading(true);
      try {
        await API({
          method: "POST",
          endpoint: "/rows",
          data: {
            dataCheckString: window.Telegram.WebApp.initData,
            sheetTitle: "Рекомендации",
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
          message: "Recommendation added",
          description: "",
          placement: "top",
        });
        form.resetFields([
          "name",
          "anothername",
          "description",
          "link",
          "dima",
          "timur",
          "maksim",
          "guest",
        ]);
      } catch (e: any) {
        notification.open({
          message: e.error.message,
          description: "",
          placement: "top",
        });
      }
      setLoading(false);
    }
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
      <Form.Item label="Podcast" name="podcast">
        <select className="select" tabIndex={0}>
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
          <Form.Item label="Type" name="type" initialValue={typeList[0]}>
            <select className="select" tabIndex={1}>
              {typeList.map((type, i) => (
                <option value={type} key={i}>
                  {type}
                </option>
              ))}
            </select>
          </Form.Item>
          <AutocompleteField form={form} typeList={typeList} />
          <Form.Item label="Another name" name="anothername">
            <Input className="input" size="large" tabIndex={3} />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input className="input" size="large" tabIndex={4} />
          </Form.Item>
          <Form.Item label="Link" name="link">
            <Input className="input" size="large" tabIndex={5} />
          </Form.Item>

          <Form.Item label="Dima" name="dima">
            <select className="select" tabIndex={6}>
              {reactionList.map((emoji, i) => (
                <option value={emoji} key={i}>
                  {emoji}
                </option>
              ))}
            </select>
          </Form.Item>

          <Form.Item label="Timur" name="timur">
            <select className="select" tabIndex={7}>
              {reactionList.map((emoji, i) => (
                <option value={emoji} key={i}>
                  {emoji}
                </option>
              ))}
            </select>
          </Form.Item>

          <Form.Item label="Maksim" name="maksim">
            <select className="select" tabIndex={8}>
              {reactionList.map((emoji, i) => (
                <option value={emoji} key={i}>
                  {emoji}
                </option>
              ))}
            </select>
          </Form.Item>
          <Form.Item label="Guest" name="guest">
            <Input className="input" size="large" tabIndex={9} />
          </Form.Item>
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

export default AddRecommendation;
