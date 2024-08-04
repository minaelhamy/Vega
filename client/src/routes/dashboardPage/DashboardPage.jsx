import "./dashboardPage.css";
import ChatSession from "../../components/ChatSession";

const DashboardPage = () => {
  return (
    <div className="dashboardPage">
      <div className="texts">
        <div className="logo">
          <img src="/logo.png" alt="" />
          <h1>VEGA</h1>
        </div>
        <ChatSession />
      </div>
    </div>
  );
};

export default DashboardPage;