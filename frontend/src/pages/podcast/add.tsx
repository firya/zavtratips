import { Layout, PageHeader } from "antd";
import { useNavigate } from "react-router-dom";

import AddPodcast from "../../components/podcast/add";

const AddPodcastPage = () => {
	const navigate = useNavigate();

	return (
		<Layout
			style={{
				minHeight: "100vh",
				width: "100%",
			}}
		>
			<PageHeader onBack={() => navigate("/podcast")} title="Add podcast" />
			<AddPodcast />
		</Layout>
	);
};

export default AddPodcastPage;
