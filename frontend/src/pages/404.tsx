import { Layout } from "antd";
import { useNavigate } from "react-router-dom";

const Page404 = () => {
	const navigate = useNavigate();
	return (
		<Layout
			style={{
				minHeight: "100vh",
				width: "100%",
				padding: "24px",
			}}
		>
			404
		</Layout>
	);
};

export default Page404;
