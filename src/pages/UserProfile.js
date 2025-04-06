import React, { useEffect, useState } from "react";
import "./UserProfile.css";
import logo from "../assets/logo.png";
import { FaUpload, FaPlus } from "react-icons/fa";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import { useNavigate } from "react-router-dom";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

function UserProfile() {
  const navigate = useNavigate();

  // States
  const [education, setEducation] = useState(() => localStorage.getItem("profile_education") || "Lorem ipsum...");
  const [research, setResearch] = useState(() => localStorage.getItem("profile_research") || "Lorem ipsum...");
  const [experience, setExperience] = useState(() => localStorage.getItem("profile_experience") || "Lorem ipsum...");
  const [skills, setSkills] = useState(() => localStorage.getItem("profile_skills") || "Lorem ipsum...");
  const [additional, setAdditional] = useState(() => localStorage.getItem("profile_additional") || "Lorem ipsum...");
  const [cvFileName, setCvFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSaveMessage, setShowSaveMessage] = useState(false);

  // Reset file name every time page is visited
  useEffect(() => {
    setCvFileName("");
  }, []);

  const handleSave = () => {
    localStorage.setItem("profile_education", education);
    localStorage.setItem("profile_research", research);
    localStorage.setItem("profile_experience", experience);
    localStorage.setItem("profile_skills", skills);
    localStorage.setItem("profile_additional", additional);

    setShowSaveMessage(true);
    setTimeout(() => setShowSaveMessage(false), 2500);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCvFileName(file.name);
    setLoading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const extractedText = await extractPDFText(arrayBuffer);
      const parsedData = await sendTextToGPT(extractedText);

      if (parsedData) {
        if (parsedData.education) setEducation(parsedData.education);
        if (parsedData.research) setResearch(parsedData.research);
        if (parsedData.experience) setExperience(parsedData.experience);
        if (parsedData.skills) setSkills(parsedData.skills);
        if (parsedData.additional) setAdditional(parsedData.additional);
      }
    } catch (err) {
      console.error("Error parsing PDF or calling GPT:", err);
      alert("Failed to parse or get GPT data.");
    } finally {
      setLoading(false);
    }
  };

  const extractPDFText = async (arrayBuffer) => {
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const strings = content.items.map((item) => item.str);
      fullText += strings.join(" ") + "\n\n";
    }
    return fullText;
  };

  const sendTextToGPT = async (text) => {
    const prompt = `
      You are an AI that parses CV text. Extract and return valid JSON of the form:
      {
        "education": "...",
        "research": "...",
        "experience": "...",
        "skills": "...",
        "additional": "..."
      }
      If info is missing, use an empty string.
      CV text:
      ${text}
    `;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to call OpenAI");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    return JSON.parse(content);
  };

  return (
    <div className="profile-page">
      {loading && (
        <div className="spinner-overlay">
          <div className="spinner" />
          <p>Parsing CV...</p>
        </div>
      )}

      <header className="top-bar">
        <div className="top-bar-left">
          <img
            src={logo}
            alt="Logo"
            className="top-bar-logo"
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
          />
        </div>

        <div className="upload-wrapper">
          <input
            type="file"
            accept=".pdf"
            id="cvUpload"
            style={{ display: "none" }}
            onChange={handleFileUpload}
          />
          <label htmlFor="cvUpload" className="upload-btn">
            <FaUpload style={{ marginRight: "0.5rem" }} />
            Upload CV
          </label>
          {cvFileName && <p className="file-label">Uploaded: {cvFileName}</p>}
        </div>
      </header>

      <main className="profile-main">
        <div className="top-actions">
          <div className="save-btn-wrapper">
            <button className="save-btn" onClick={handleSave}>
              Save Changes
            </button>
            <p className={`save-message ${showSaveMessage ? "visible" : "hidden"}`}>
              Changes saved!
            </p>
          </div>
        </div>

        <h2>User Profile</h2>

        <div className="profile-grid">
          <div className="left-col">
            <div className="section">
              <h3>Education History:</h3>
              <textarea value={education} onChange={(e) => setEducation(e.target.value)} />
            </div>
            <div className="section">
              <h3>Research:</h3>
              <textarea value={research} onChange={(e) => setResearch(e.target.value)} />
            </div>
            <div className="section">
              <h3>Experience:</h3>
              <textarea value={experience} onChange={(e) => setExperience(e.target.value)} />
            </div>
          </div>

          <div className="right-col">
            <div className="section">
              <h3>Skills:</h3>
              <textarea value={skills} onChange={(e) => setSkills(e.target.value)} />
            </div>
            <div className="section">
              <h3>Additional Information:</h3>
              <textarea value={additional} onChange={(e) => setAdditional(e.target.value)} />
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
