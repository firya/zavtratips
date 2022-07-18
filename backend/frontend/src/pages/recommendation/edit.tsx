import DefaultLayout from "../../layout";

import EditRecommendation from "../../components/recommendation/edit";

const EditRecommendationPage = () => {
  return (
    <DefaultLayout title="Edit recommendation" link="/recommendation">
      <EditRecommendation />
    </DefaultLayout>
  );
};

export default EditRecommendationPage;
