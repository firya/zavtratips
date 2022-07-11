import { Layout, PageHeader } from "antd";
import { useNavigate } from "react-router-dom";

import EditPodcast from "../../components/podcast/edit";

const EditPodcastPage = () => {
	const navigate = useNavigate();

	return (
		<Layout
			style={{
				minHeight: "100vh",
				width: "100%",
			}}
		>
			<PageHeader onBack={() => navigate("/podcast")} title="Edit podcast" />
			<EditPodcast />
		</Layout>
	);
};

export default EditPodcastPage;
