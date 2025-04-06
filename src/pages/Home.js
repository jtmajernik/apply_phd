import React from "react";
import "./Home.css";
import logo from "../assets/logo.png";
import pennLogo from "../assets/penn_logo.png"; // Add these images to your assets folder
import princetonLogo from "../assets/princeton_logo.png";
import { FaUserCircle, FaSearch, FaTrashAlt, FaPlus } from "react-icons/fa";

function Home() {
  return (
    <div className="home-page">
      {/* Top Bar */}
      <header className="top-bar">
        <img src={logo} alt="ApplyPhD logo" className="top-bar-logo" />
        <div className="top-bar-profile">
          <FaUserCircle className="profile-icon" />
          <span>Edit Profile</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="home-content">
        <div className="section-header">
          <h2>Schools List</h2>
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input type="text" placeholder="Search" disabled />
          </div>
        </div>

        {/* School Cards */}
        <div className="school-card">
          <img src={pennLogo} alt="Penn logo" className="school-logo" />
          <div className="school-info">
            <h3>University Of Pennsylvania</h3>
            <p><strong>Letters of Recommendation</strong></p>
            <p>Prof1 — sent ✅</p>
            <p>Prof2 — unsent ⬛</p>
          </div>
          <div className="school-actions">
            <button className="sop-button">SOP Maker</button>
            <FaTrashAlt className="delete-icon" />
          </div>
        </div>

        <div className="school-card">
          <img src={princetonLogo} alt="Princeton logo" className="school-logo" />
          <div className="school-info">
            <h3>Princeton University</h3>
            <p><strong>Letters of Recommendation</strong></p>
            <p>Prof1 — sent ✅</p>
            <p>Prof2 — unsent ⬛</p>
          </div>
          <div className="school-actions">
            <button className="sop-button">SOP Maker</button>
            <FaTrashAlt className="delete-icon" />
          </div>
        </div>

        {/* Add School Section */}
        <div className="add-school">
          <FaPlus className="plus-icon" />
          <span>Add Schools</span>
        </div>
      </main>
    </div>
  );
}

export default Home;
