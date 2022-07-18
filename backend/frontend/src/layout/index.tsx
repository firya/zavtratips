import { useMemo } from "react";
import { Layout, PageHeader } from "antd";
import { useNavigate } from "react-router-dom";

interface IdefaultLayout {
  title: string;
  link?: string;
  children?: any;
}

const DefaultLayout = ({ title, link = "", children = "" }: IdefaultLayout) => {
  const navigate = useNavigate();

  const headerHandler = useMemo(() => {
    return link.length > 0 ? (
      <PageHeader onBack={() => navigate(link)} title={title} />
    ) : (
      <PageHeader title={title} />
    );
  }, [link]);

  return (
    <Layout
      style={{
        minHeight: "100vh",
        width: "100%",
        padding: "0px 0px 230px",
      }}
    >
      {headerHandler}
      {children}
    </Layout>
  );
};

export default DefaultLayout;
