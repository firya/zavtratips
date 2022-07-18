import EditPodcast from "../../components/podcast/edit";
import DefaultLayout from "../../layout";

const EditPodcastPage = () => {
  return (
    <DefaultLayout title="Edit podcast" link="/podcast">
      <EditPodcast />
    </DefaultLayout>
  );
};

export default EditPodcastPage;
