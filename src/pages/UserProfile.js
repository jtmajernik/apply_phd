import React from "react";
import "./UserProfile.css";
import logo from "../assets/logo.png";
import { FaUpload, FaPlus } from "react-icons/fa";

function UserProfile() {
  return (
    <div className="profile-page">
      {/* Top Bar */}
      <header className="top-bar">
        <div className="top-bar-left">
          <img src={logo} alt="Logo" className="top-bar-logo" />
        </div>
        <button className="upload-btn">
          <FaUpload style={{ marginRight: "0.5rem" }} />
          Upload CV
        </button>
      </header>

      {/* Main Section */}
      <main className="profile-main">
        <h2>User Profile</h2>
        <div className="profile-grid">
          <div className="left-col">
            <div className="section">
              <h3>Education History:</h3>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
            </div>

            <div className="section">
              <h3>Research:</h3>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
            </div>

            <div className="section">
              <h3>Experience:</h3>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
            </div>
          </div>

          <div className="right-col">
            <div className="section">
              <h3>Skills:</h3>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
            </div>

            <div className="section">
              <h3>Additional Information:</h3>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
            </div>
          </div>
        </div>

        <div className="add-section">
          <FaPlus className="plus-icon" />
          <span>Add Sections</span>
        </div>
      </main>
    </div>
  );
}

export default UserProfile;
