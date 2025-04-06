import React from "react";
import "./SopGenerator.css";
import logo from "../assets/logo.png";
import { FaUserCircle, FaDownload } from "react-icons/fa";

function SopGenerator() {
  return (
    <div className="sop-page">
      {/* Top Bar */}
      <header className="top-bar">
        <div className="top-bar-left">
          <img src={logo} alt="Logo" className="top-bar-logo" />
        </div>
        <div className="top-bar-profile">
          <FaUserCircle className="profile-icon" />
          <span>Edit Profile</span>
        </div>
      </header>

      {/* Page Content */}
      <main className="sop-main">
        {/* Table Header */}
        <div className="sop-table-header">
          <div>Professors</div>
          <div>Research Interests</div>
          <div>Program</div>
          <div>Interview Sent</div>
        </div>

        {/* Static rows */}
        <div className="sop-row">
          <div className="checkbox checked"></div>
          <div className="prof-name">Andrew Head</div>
          <div>HCI, Programming, Reading</div>
          <div>CIS PhD</div>
          <div>Not sure</div>
        </div>
        <div className="sop-row">
          <div className="checkbox checked"></div>
          <div className="prof-name">Danaé Metaxa</div>
          <div>HCI, bias and representation in algorithmic systems</div>
          <div>CIS PhD</div>
          <div>Not sure</div>
        </div>

        {/* Feedback input and button */}
        <div className="sop-input-section">
          <div className="sop-input-label">Tell us how you want us to refine your SOP</div>
          <button className="sop-button">Regenerate SOP</button>
        </div>

        {/* SOP Output + Download */}
        <div className="sop-output-section">
          <div className="sop-output-box">
            <h3>SOP For XXX</h3>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
              vehicula, tortor at tempor aliquam...
            </p>
          </div>
          <div className="download-icon">
            <FaDownload />
          </div>
        </div>
      </main>
    </div>
  );
}

export default SopGenerator;
