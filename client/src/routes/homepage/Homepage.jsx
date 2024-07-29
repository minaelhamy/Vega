import { Link } from "react-router-dom";
import "./homepage.css";
import { TypeAnimation } from "react-type-animation";
import { useState } from "react";

const Homepage = () => {
  const [typingStatus, setTypingStatus] = useState("human1");

  return (
    <div className="homepage">
      <img src="/orbital.png" alt="" className="orbital" />
      <div className="left">
        <h1>VEGA</h1>
        <h2>Your AI Business Consultant</h2>
        <h4>
        Vega leverages advanced AI to help you generate more revenue and optimize profit margins.<br></br> 
        </h4>
        <Link to="/dashboard">Get Started</Link>
      </div>
      <div className="right">
        <div className="imgContainer">
          <div className="bgContainer">
            <div className="bg"></div>
          </div>
          <img src="/bot.png" alt="" className="bot" />
          <div className="chat">
            <img
              src={
                typingStatus === "human1"
                  ? "/human1.jpeg"
                  : typingStatus === "human2"
                  ? "/human2.jpeg"
                  : "bot.png"
              }
              alt=""
            />
            <TypeAnimation
              sequence={[
                // Same substring at the start will only be typed out once, initially
                "Human:What should our pricing strategy be for the new product?",
                2000,
                () => {
                  setTypingStatus("bot");
                },
                "VEGA:Based on market trends, I recommend a price range of $20-$25.",
                2000,
                () => {
                  setTypingStatus("human2");
                },
                "Human2:How can we increase our profit margins?",
                2000,
                () => {
                  setTypingStatus("bot");
                },
                "VEGA:Consider optimizing your supply chain and adjusting your pricing model.",
                2000,
                () => {
                  setTypingStatus("human1");
                },
                "Human:Which customer segment should we target for our new campaign?",
              2000,
              () => {
                setTypingStatus("bot");
              },
              "VEGA:I suggest targeting mid-sized retailers who have shown interest in similar products.",
              2000,
              () => {
                setTypingStatus("human2");
              },
              "Human2:Can you analyze our sales data from last quarter?",
              2000,
              () => {
                setTypingStatus("bot");
              },
              "VEGA:Sales increased by 15% in the third quarter, with the highest growth in the tech sector.",
              2000,
              () => {
                setTypingStatus("human1");
              },
              ]}
              wrapper="span"
              repeat={Infinity}
              cursor={true}
              omitDeletionAnimation={true}
            />
          </div>
        </div>
      </div>
      <div className="terms">
        <img src="/logo.png" alt="" />
        <div className="links">
          <Link to="/">Terms of Service</Link>
          <span>|</span>
          <Link to="/">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
