import { Layout, PageHeader } from "antd";
import { useNavigate } from "react-router-dom";

import AddRecommendation from "../../components/recommendation/add";

const AddRecommendationPage = () => {
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
				title="Add recommendation"
			/>
			<AddRecommendation />
		</Layout>
	);
};

export default AddRecommendationPage;
