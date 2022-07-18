import { Button, Space, Layout, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import DefaultLayout from "../layout";

const { Title } = Typography;

const MainPage = () => {
  const navigate = useNavigate();
  return (
    <DefaultLayout title="Choose what to add/edit">
      <Space direction="vertical" align="center">
        <Button
          type="primary"
          size="large"
          className="default_button"
          onClick={() => navigate("/podcast")}
        >
          Podcast
        </Button>
        <Button
          type="primary"
          size="large"
          className="default_button"
          onClick={() => navigate("/recommendation")}
        >
          Recommendation
        </Button>
      </Space>
    </DefaultLayout>
  );
};

export default MainPage;
