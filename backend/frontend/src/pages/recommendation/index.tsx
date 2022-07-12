import { Layout, PageHeader, Button, Space } from "antd";
import { useNavigate } from "react-router-dom";

const RecommendationPage = () => {
	const navigate = useNavigate();

	return (
		<Layout
			style={{
				minHeight: "100vh",
				width: "100%",
			}}
		>
			<PageHeader onBack={() => navigate("/")} title="Recommendations" />

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
		</Layout>
	);
};

export default RecommendationPage;
