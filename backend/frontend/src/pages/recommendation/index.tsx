import { Layout, Button, Space } from "antd";
import { useNavigate } from "react-router-dom";
import DefaultLayout from "../../layout";

const RecommendationPage = () => {
  const navigate = useNavigate();

  return (
    <DefaultLayout title="Recommendations" link="/">
      <Layout
        style={{
          padding: "24px",
        }}
      >
        <Space direction="vertical" align="center">
          <Button
            type="primary"
            size="large"
            className="default_button"
            onClick={() => navigate("/recommendation/add")}
          >
            Add new recommendation
          </Button>

          <Button
            size="large"
            className="default_button"
            onClick={() => navigate("/recommendation/edit")}
          >
            Edit existing
          </Button>
        </Space>
      </Layout>
    </DefaultLayout>
  );
};

export default RecommendationPage;
