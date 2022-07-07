import { Layout, PageHeader, Divider, Button, Space } from "antd";
import { useNavigate } from "react-router-dom";

const PodcastPage = () => {
	const navigate = useNavigate();

	return (
		<Layout
			style={{
				minHeight: "100vh",
				width: "100%",
			}}
		>
			<PageHeader onBack={() => navigate("/")} title="Podcast" />

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
		</Layout>
	);
};

export default PodcastPage;
