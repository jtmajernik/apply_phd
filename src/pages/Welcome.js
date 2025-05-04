import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import logo from "../assets/logo.png";
import "./Home.css";

function Welcome() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/");
  };
  
  const handleStartTutorial = () => {
    // Navigate to home and pass state to trigger tutorial
    navigate("/", { state: { showTutorial: true } });
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

      <main className="welcome-content" style={{ 
        textAlign: "center", 
        maxWidth: "800px", 
        margin: "0 auto", 
        padding: "2rem 1rem" 
      }}>
        <h1 style={{ 
          fontSize: "2.5rem", 
          color: "#426E95", 
          marginBottom: "2rem" 
        }}>Welcome to ApplyPhD!</h1>
        
        <p style={{ 
          fontSize: "1.2rem", 
          lineHeight: "1.6", 
          marginBottom: "1.5rem" 
        }}>
          ApplyPhD is your personalized PhD application tracker. Easily add schools, track your letters of recommendation, and generate customized Statements of Purpose (SOPs).
        </p>
        
        <p style={{ 
          fontSize: "1.2rem", 
          marginBottom: "2.5rem" 
        }}>
          Ready to get started? Choose an option below!
        </p>

        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          gap: "1.5rem",
          flexWrap: "wrap" 
        }}>
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
              transition: "background-color 0.3s",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = "#355980"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#426E95"}
          >
            Get Started
          </button>
          
          <button
            onClick={handleStartTutorial}
            style={{
              backgroundColor: "#ffffff",
              color: "#426E95",
              padding: "1rem 2rem",
              fontSize: "1.2rem",
              borderRadius: "8px",
              border: "2px solid #426E95",
              cursor: "pointer",
              transition: "all 0.3s",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#f0f7ff";
              e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "#ffffff";
              e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
            }}
          >
            Start Homepage Tutorial
          </button>
        </div>
      </main>
    </div>
  );
}

export default Welcome;
