import DefaultLayout from "../../layout";

import AddRecommendation from "../../components/recommendation/add";

const AddRecommendationPage = () => {
  return (
    <DefaultLayout title="Add recommendation" link="/recommendation">
      <AddRecommendation />
    </DefaultLayout>
  );
};

export default AddRecommendationPage;
