import React from 'react';
import './dashboardPage.css';

const DashboardPage = () => {
  return (
    <div className="dashboardPage">
      <div className="texts">
        <div className="logo">
          <img src="/logo.png" alt="Logo" />
          <h1>My App</h1>
        </div>
        <div className="options">
          <div className="option">
            <img src="/icon1.png" alt="Option 1" />
            Option 1
          </div>
          <div className="option">
            <img src="/icon2.png" alt="Option 2" />
            Option 2
          </div>
        </div>
      </div>
      <div className="formContainer">
        <form>
          <input type="text" placeholder="Type something..." />
          <button type="submit">
            <img src="/send.png" alt="Send" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default DashboardPage;
