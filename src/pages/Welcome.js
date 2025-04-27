import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import logo from "../assets/logo.png";
import "./Home.css";

function Welcome() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    const wantsTutorial = window.confirm("Do you want to take a tutorial of the home page?");
    if (wantsTutorial) {
      // Navigate to home and pass state to trigger tutorial
      navigate("/", { state: { showTutorial: true } });
    } else {
      navigate("/");
    }
  };

  return (
    <div className="home-page">
      <header className="top-bar">
        <Link to="/" onClick={() => {}}>
          <img src={logo} alt="ApplyPhD logo" className="top-bar-logo" />
        </Link>
        <Link to="/profile" className="top-bar-profile-link">
          <div className="top-bar-profile">
            <FaUserCircle className="profile-icon" />
            <span>Edit Profile</span>
          </div>
        </Link>
      </header>

      <main className="home-content">
        <h1>Welcome to ApplyPhD!</h1>
        <p>
          ApplyPhD is your personalized PhD application tracker. Easily add schools, track your letters of recommendation, and generate customized Statements of Purpose (SOPs).
        </p>
        <p>
          Ready to get started? Click below!
        </p>

        <div style={{ marginTop: "2rem" }}>
          <button
            onClick={handleGetStarted}
            style={{
              backgroundColor: "#426E95",
              color: "white",
              padding: "1rem 2rem",
              fontSize: "1.2rem",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Get Started
          </button>
        </div>
      </main>
    </div>
  );
}

export default Welcome;
