import { Layout, Button, Space } from "antd";
import { useNavigate } from "react-router-dom";
import DefaultLayout from "../../layout";

const PodcastPage = () => {
  const navigate = useNavigate();

  return (
    <DefaultLayout title="Podcast" link="/">
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
            onClick={() => navigate("/podcast/add")}
          >
            Add new podcast
          </Button>

          <Button
            size="large"
            className="default_button"
            onClick={() => navigate("/podcast/edit")}
          >
            Edit existing
          </Button>
        </Space>
      </Layout>
    </DefaultLayout>
  );
};

export default PodcastPage;
