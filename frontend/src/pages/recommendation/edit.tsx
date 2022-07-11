import { Layout, PageHeader } from "antd";
import { useNavigate } from "react-router-dom";

import EditRecommendation from "../../components/recommendation/edit";

const EditRecommendationPage = () => {
	const navigate = useNavigate();

	return (
		<Layout
			style={{
				minHeight: "100vh",
				width: "100%",
			}}
		>
			<PageHeader
				onBack={() => navigate("/recommendation")}
				title="Edit recommendation"
			/>
			<EditRecommendation />
		</Layout>
	);
};

export default EditRecommendationPage;
