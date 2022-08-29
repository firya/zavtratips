import { useState } from "react";
import {
  Form,
  Input,
  Button,
  DatePicker,
  InputNumber,
  TimePicker,
  notification,
} from "antd";
import API from "../../libs/api";

const AddPodcast = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    if (!loading) {
      setLoading(true);
      try {
        await API({
          method: "POST",
          endpoint: "/rows",
          data: {
            dataCheckString: window.Telegram.WebApp.initData,
            sheetTitle: "Выпуски",
            data: {
              Дата: values.date ? values.date.format("M/D/YYYY") : "",
              Шоу: values.type,
              "Выпуск, №": values.number,
              Название: values.title || "",
              Продолжительность: values.length
                ? values.length.format("HH:mm:ss")
                : "",
            },
          },
        });

        notification.open({
          message: "Podcast added",
          description: "",
          placement: "top",
        });

        form.resetFields();
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
      <Form.Item label="Date" name="date">
        <DatePicker
          format="DD.MM.YYYY"
          style={{ width: "100%" }}
          className="input"
          size="large"
          tabIndex={0}
        />
      </Form.Item>

      <Form.Item
        label="Type"
        name="type"
        rules={[{ required: true, message: "Please choose type" }]}
        initialValue="Zavtracast"
      >
        <select style={{ width: "100%" }} className="select" tabIndex={1}>
          <option value="Zavtracast">Zavtracast</option>
          <option value="ДТКД">ДТКД</option>
        </select>
      </Form.Item>

      <Form.Item
        label="Number"
        name="number"
        rules={[{ required: true, message: "Please input number" }]}
      >
        <Input
          style={{ width: "100%" }}
          className="input"
          size="large"
          tabIndex={2}
        />
      </Form.Item>

      <Form.Item label="Title" name="title">
        <Input
          style={{ width: "100%" }}
          className="input"
          size="large"
          tabIndex={3}
        />
      </Form.Item>

      <Form.Item label="Length" name="length">
        <TimePicker
          placement="topLeft"
          showNow={false}
          style={{ width: "100%" }}
          className="input"
          size="large"
          tabIndex={4}
        />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AddPodcast;
