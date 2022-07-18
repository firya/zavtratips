import DefaultLayout from "../../layout";

import AddPodcast from "../../components/podcast/add";

const AddPodcastPage = () => {
  return (
    <DefaultLayout title="Add podcast" link="/podcast">
      <AddPodcast />
    </DefaultLayout>
  );
};

export default AddPodcastPage;
