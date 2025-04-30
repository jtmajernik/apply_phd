import React, { useEffect, useState, useRef } from "react";
import "./UserProfile.css";
import logo from "../assets/logo.png";
import { FaUpload } from "react-icons/fa";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import { useNavigate } from "react-router-dom";
import Joyride from "react-joyride";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

function UserProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  const [education, setEducation] = useState(() => localStorage.getItem("profile_education") || "Lorem ipsum...");
  const [research, setResearch] = useState(() => localStorage.getItem("profile_research") || "Lorem ipsum...");
  const [experience, setExperience] = useState(() => localStorage.getItem("profile_experience") || "Lorem ipsum...");
  const [skills, setSkills] = useState(() => localStorage.getItem("profile_skills") || "Lorem ipsum...");
  const [interests, setInterests] = useState(() => localStorage.getItem("profile_interests") || "Lorem ipsum...");
  const [additional, setAdditional] = useState(() => localStorage.getItem("profile_additional") || "Lorem ipsum...");
  const [loading, setLoading] = useState(false);
  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const [tutorialActive, setTutorialActive] = useState(false);

  const tutorialSteps = [
    {
      target: '.upload-btn',
      content: 'Click here to upload your CV for automatic profile filling.',
    },
    {
      target: '.top-bar-row',
      content: 'This section displays your User Profile header and save/reset actions.',
    },
    {
      target: '.profile-grid',
      content: 'Edit your profile details in these fields.',
    },
  ];

  useEffect(() => {
    // This effect is empty as per original code
  }, []);

  const handleSave = () => {
    localStorage.setItem("profile_education", education);
    localStorage.setItem("profile_research", research);
    localStorage.setItem("profile_experience", experience);
    localStorage.setItem("profile_skills", skills);
    localStorage.setItem("profile_interests", interests);
    localStorage.setItem("profile_additional", additional);

    setShowSaveMessage(true);
    setTimeout(() => setShowSaveMessage(false), 3000);
  };

  const handleResetFields = () => {
    setEducation("");
    setResearch("");
    setExperience("");
    setSkills("");
    setInterests("");
    setAdditional("");

    // Reset the file input element
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Increment fileInputKey to force re-render of the file input
    setFileInputKey(prevKey => prevKey + 1);

    localStorage.removeItem("profile_education");
    localStorage.removeItem("profile_research");
    localStorage.removeItem("profile_experience");
    localStorage.removeItem("profile_skills");
    localStorage.removeItem("profile_interests");
    localStorage.removeItem("profile_additional");
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const extractedText = await extractPDFText(arrayBuffer);
      const parsedData = await sendTextToGPT(extractedText);

      console.log("Received parsed data:", parsedData);

      if (parsedData) {
        // For each field, check if it exists and is not empty
        if (parsedData.education) setEducation(parsedData.education);
        if (parsedData.research) setResearch(parsedData.research);
        if (parsedData.experience) setExperience(parsedData.experience);
        if (parsedData.skills) setSkills(parsedData.skills);

        // Explicitly handle interests and additional with extra logging
        console.log("Interests data:", parsedData.interests);
        console.log("Additional data:", parsedData.additional);

        if (parsedData.interests && parsedData.interests.trim() !== "") {
          setInterests(parsedData.interests);
        }

        if (parsedData.additional && parsedData.additional.trim() !== "") {
          setAdditional(parsedData.additional);
        }
      }
    } catch (err) {
      console.error("Error parsing PDF or calling GPT:", err);
      alert("Failed to parse or get GPT data.");
    } finally {
      setLoading(false);

      // Reset the file input element to allow re-uploading the same file
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Increment fileInputKey to force re-render of the file input
      setFileInputKey(prevKey => prevKey + 1);
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
        "interests": "...",
        "additional": "..."
      }
      
      IMPORTANT INSTRUCTIONS:
      - For "interests", guess what the user's interests are based on the CV.
      - Look for sections labeled "Interests", "Hobbies", "Personal Interests", or similar headings.
      - If interests are mentioned anywhere in the CV, even in an "Additional Information" or similar section, extract them and place them in the "interests" field.
      - For "additional", include any miscellaneous information that doesn't fit into the other categories.
      - Even if you're unsure about a section, make your best guess and include the information.
      - If info is completely missing for any field, use an empty string.
      - Ensure your response is valid JSON that can be parsed directly.
      
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

    try {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim();

      // Log the raw content for debugging
      console.log("Raw GPT response:", content);

      // Parse with error handling
      try {
        return JSON.parse(content);
      } catch (parseError) {
        console.error("Error parsing JSON from GPT response:", parseError);
        console.log("Attempting to clean and parse the response...");

        // Try to extract just the JSON part (in case there's extra text)
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            return JSON.parse(jsonMatch[0]);
          } catch (secondError) {
            console.error("Still failed to parse JSON after cleaning:", secondError);
            throw new Error("Could not parse GPT response as JSON");
          }
        } else {
          throw new Error("No JSON object found in GPT response");
        }
      }
    } catch (error) {
      console.error("Error processing GPT response:", error);
      throw error;
    }
  };

  return (
    <div className="profile-page">
      {tutorialActive && (
        <Joyride
          steps={tutorialSteps}
          run={tutorialActive}
          continuous={true}
          showSkipButton={true}
          callback={(data) => {
            const { status } = data;
            if (status === 'finished' || status === 'skipped') {
              setTutorialActive(false);
            }
          }}
        />
      )}

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
            key={fileInputKey}
            type="file"
            accept=".pdf"
            id="cvUpload"
            style={{ display: "none" }}
            onChange={handleFileUpload}
            ref={fileInputRef}
          />
          <label htmlFor="cvUpload" className="upload-btn">
            <FaUpload style={{ marginRight: "0.5rem" }} />
            Upload CV
          </label>
        </div>
      </header>

      <main className="profile-main">
        <div className="top-bar-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h2 style={{ margin: 0 }}>User Profile</h2>
            <button
            className="tutorial-button"
              onClick={() => setTutorialActive(true)}
              style={{ padding: '0.5rem 1rem' }}
            >
              Show Tutorial
            </button>
          </div>
          <div className="top-actions">
            <div className="save-btn-wrapper">
              <button className="save-btn" onClick={handleSave}>Save Changes</button>
              <button className="reset-btn" onClick={handleResetFields}>Reset Fields</button>
              <p className={`save-message ${showSaveMessage ? "visible" : ""}`}>Changes saved!</p>
            </div>
          </div>
        </div>

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
              <h3>Interests:</h3>
              <textarea value={interests} onChange={(e) => setInterests(e.target.value)} />
            </div>
            <div className="section">
              <h3>Additional Information:</h3>
              <textarea value={additional} onChange={(e) => setAdditional(e.target.value)} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default UserProfile;