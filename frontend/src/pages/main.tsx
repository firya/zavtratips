import { Button, Space, Layout, Typography } from "antd";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const MainPage = () => {
	const navigate = useNavigate();
	return (
		<Layout
			style={{
				minHeight: "100vh",
				width: "100%",
				padding: "24px",
			}}
		>
			<Space direction="vertical" align="center">
				backend route: {process.env.REACT_APP_BACKEND_URL}
				<Title level={4}>Choose what to add/edit</Title>
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
		</Layout>
	);
};

export default MainPage;
