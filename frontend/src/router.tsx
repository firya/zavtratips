import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import MainPage from "./pages/main";
import PodcastPage from "./pages/podcast";
import AddPodcastPage from "./pages/podcast/add";
import EditPodcastPage from "./pages/podcast/edit";
import RecommendationPage from "./pages/recommendation";
import AddRecommendationPage from "./pages/recommendation/add";
import EditRecommendationPage from "./pages/recommendation/edit";
import Page404 from "./pages/404";

const RouterComponent = () => {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<MainPage />} />
				<Route path="/podcast" element={<PodcastPage />} />
				<Route path="/podcast/add" element={<AddPodcastPage />} />
				<Route path="/podcast/edit" element={<EditPodcastPage />} />
				<Route path="/recommendation" element={<RecommendationPage />} />
				<Route path="/recommendation/add" element={<AddRecommendationPage />} />
				<Route
					path="/recommendation/edit"
					element={<EditRecommendationPage />}
				/>
				<Route path="/*" element={<Page404 />} />
			</Routes>
		</Router>
	);
};

export default RouterComponent;
