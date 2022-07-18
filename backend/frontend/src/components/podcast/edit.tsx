import { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  DatePicker,
  Skeleton,
  TimePicker,
  notification,
} from "antd";
import API from "../../libs/api";
import moment from "moment";

const EditPodcast = () => {
  const [loading, setLoading] = useState<boolean>(false);

  const [loadingPodcastList, setLoadingPodcastList] = useState<boolean>(true);
  const [podcastList, setPodcastList] = useState<any[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    loadPodcastList();
  }, []);

  useEffect(() => {
    if (podcastList.length > 0) {
      handleChangePodcast(0);
    }
  }, [podcastList]);

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
      const rowNumber = podcastList[values.podcast].rowNumber;
      try {
        await API({
          method: "PUT",
          endpoint: `/rows/`,
          data: {
            dataCheckString: window.Telegram.WebApp.initData,
            sheetTitle: "Выпуски",
            rowNumber: rowNumber,
            data: {
              Дата: values.date ? values.date.format("M/D/YYYY") : "",
              Шоу: podcastList[values.podcast].data["Шоу"],
              "Выпуск, №": podcastList[values.podcast].data["Выпуск, №"],
              Название: values.title || "",
              Продолжительность: values.length
                ? values.length.format("HH:mm:ss")
                : "",
            },
          },
        });

        notification.open({
          message: "Podcast changed",
          description: "",
          placement: "top",
        });
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

  const handleChangePodcast = (value: number) => {
    const time = podcastList[value].data["Продолжительность"]
      ? moment(podcastList[value].data["Продолжительность"], "hh:mm:ss")
      : null;

    let date;
    if (podcastList[value].data["Дата"] !== "") {
      if (podcastList[value].data["Дата"].indexOf("/") !== -1) {
        date = moment(podcastList[value].data["Дата"], "MM/DD/YYYY");
      } else {
        date = moment(podcastList[value].data["Дата"], "DD.MM.YYYY");
      }
    }

    form.setFieldsValue({
      podcast: value,
      date: date,
      title: podcastList[value].data["Название"],
      length: time,
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
          className="select"
          tabIndex={0}
          onChange={(e) => handleChangePodcast(+e.target.value)}
        >
          {podcastList.map((podcast, i) => (
            <option value={i} key={i}>
              {podcast.data["Шоу и номер"]}
            </option>
          ))}
        </select>
      </Form.Item>

      {!loadingPodcastList ? (
        <>
          <Form.Item label="Date" name="date">
            <DatePicker
              onChange={() => {}}
              format="DD.MM.YYYY"
              style={{ width: "100%" }}
              size="large"
              tabIndex={1}
            />
          </Form.Item>

          <Form.Item label="Title" name="title">
            <Input style={{ width: "100%" }} size="large" tabIndex={2} />
          </Form.Item>

          <Form.Item label="Length" name="length">
            <TimePicker
              showNow={false}
              placement="topLeft"
              style={{ width: "100%" }}
              size="large"
              tabIndex={3}
            />
          </Form.Item>
        </>
      ) : (
        <Skeleton active />
      )}

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

export default EditPodcast;
