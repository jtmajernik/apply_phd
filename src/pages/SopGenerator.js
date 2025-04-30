import React, { useState, useRef } from "react";
import "./SopGenerator.css";
import logo from "../assets/logo.png";
import { FaUserCircle } from "react-icons/fa";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import {Link, useNavigate} from "react-router-dom";
import Joyride from "react-joyride"; // Added import for Joyride

// Set the worker for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

function SopGenerator() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const [professorsData, setProfessorsData] = useState([
    {
      id: Date.now(),
      name: "",
      researchInterests: ["HCI"],
      program: "CIS PhD",
      interviewSent: "Not Sure",
    },
  ]);

  const [sopRefinement, setSopRefinement] = useState("");
  const [sopFile, setSopFile] = useState(null);
  const [sopOutput, setSopOutput] = useState("");
  const [displayedSopOutput, setDisplayedSopOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tutorialActive, setTutorialActive] = useState(false); // New state for tutorialActive

  const tutorialSteps = [ // Defined tutorial steps array
    {
      target: '.prof-details-header',
      content: 'Here you can view and manage professor details.',
    },
    {
      target: '.add-btn',
      content: 'Click here to add a new professor row.',
    },
    {
      target: '.professor-table',
      content: 'This table shows the current professors and their associated details.',
    },
    {
      target: '.sop-section',
      content: 'Use this section to refine your SOP and upload your file.',
    },
    {
      target: '.generate-btn',
      content: 'Click here to generate SOP recommendations.',
    },
  ];

  const professorOptions = [
    "Andrew Head",
    "Danaë Metaxa",
    "Chris Callison-Burch",
  ];
  const researchInterestOptions = ["HCI"];

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      setSopFile(event.dataTransfer.files[0]);
      event.dataTransfer.clearData();
    }
  };

  const handleFileSelect = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      setSopFile(event.target.files[0]);
    }
  };

  const handleProfessorNameChange = (id, value) => {
    setProfessorsData((prev) =>
      prev.map((prof) => (prof.id === id ? { ...prof, name: value } : prof))
    );
  };

  const handleResearchInterestsChange = (id, selectedOptions) => {
    setProfessorsData((prev) =>
      prev.map((prof) =>
        prof.id === id ? { ...prof, researchInterests: selectedOptions } : prof
      )
    );
  };

  const handleProgramChange = (id, value) => {
    setProfessorsData((prev) =>
      prev.map((prof) => (prof.id === id ? { ...prof, program: value } : prof))
    );
  };

  const handleInterviewSentChange = (id, value) => {
    setProfessorsData((prev) =>
      prev.map((prof) =>
        prof.id === id ? { ...prof, interviewSent: value } : prof
      )
    );
  };

  const addProfessorRow = () => {
    const newRow = {
      id: Date.now(),
      name: "",
      researchInterests: ["HCI"],
      program: "CIS PhD",
      interviewSent: "Not Sure",
    };
    setProfessorsData((prev) => [...prev, newRow]);
  };

  const removeProfessorRow = (id) => {
    setProfessorsData((prev) => prev.filter((prof) => prof.id !== id));
  };

  const extractPDFText = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
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

  const typeWriterEffect = (fullText) => {
    if (fullText.length > 0) {
      setDisplayedSopOutput(fullText.charAt(0));
    }
    let index = 1;
    const interval = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedSopOutput((prev) => prev + fullText.charAt(index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 20);
  };

  const handleGenerateSOP = async () => {
    setLoading(true);
    try {
      let fileContent = "";
      if (sopFile) {
        fileContent = await extractPDFText(sopFile);
      }

      const prompt = `Refine my SOP based on the instructions:
${sopRefinement}

Here is my current SOP draft:
${fileContent}
Review the SOP and provide a list of specific changes that I can make to improve my SOP based on the instructions. After each piece of advice, include 2 line breaks.`;

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
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
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("OpenAI API Error:", errorData);
        throw new Error("Failed to generate SOP");
      }

      const data = await response.json();
      const generatedText = data?.choices?.[0]?.message?.content || "";
      setSopOutput(generatedText);
      typeWriterEffect(generatedText);
    } catch (error) {
      console.error("Error generating SOP:", error);
      alert("There was an error generating your SOP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sop-page">
      {tutorialActive && ( // Added Joyride component
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
          <p>Reviewing SOP...</p>
        </div>
      )}

      <header className="top-bar">
        <div className="top-bar-left">
          <img
            src={logo}
            alt="Logo"
            className="top-bar-logo"
            onClick={() => navigate("/")}
          />
        </div>
        <Link to="/profile" className="top-bar-profile-link">
          <div className="top-bar-profile">
            <FaUserCircle className="profile-icon" />
            <span>Edit Profile</span>
          </div>
        </Link>
      </header>

      <main className="sop-main">
        <div className="prof-details-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ margin: 0 }}>Professor Details</h1>
          <button
          className="tutorial-button"
            onClick={() => setTutorialActive(true)}
            style={{ padding: '0.5rem 1rem' }}
          >
            Show Tutorial
          </button>
        </div>
        <table className="professor-table">
          <thead>
            <tr>
              <th>Professor</th>
              <th>Research Interests</th>
              <th>Program</th>
              <th>Interview Sent</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {professorsData.map((row) => (
              <tr key={row.id}>
                <td>
                  <select
                    value={row.name}
                    onChange={(e) =>
                      handleProfessorNameChange(row.id, e.target.value)
                    }
                    className="beautiful-select"
                  >
                    <option value="">Select a Professor</option>
                    {professorOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    value={row.researchInterests}
                    onChange={(e) =>
                      handleResearchInterestsChange(
                        row.id,
                        Array.from(e.target.selectedOptions, (option) => option.value)
                      )
                    }
                    className="beautiful-select"
                  >
                    {researchInterestOptions.map((interest) => (
                      <option key={interest} value={interest}>
                        {interest}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    value={row.program}
                    onChange={(e) => handleProgramChange(row.id, e.target.value)}
                    className="beautiful-select"
                  >
                    <option value="CIS PhD">CIS PhD</option>
                  </select>
                </td>
                <td>
                  <select
                    value={row.interviewSent}
                    onChange={(e) =>
                      handleInterviewSentChange(row.id, e.target.value)
                    }
                    className="beautiful-select"
                  >
                    <option value="Not Sure">Not Sure</option>
                    <option value="Yes">Yes</option>
                  </select>
                </td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => removeProfessorRow(row.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="center-section">
          <div className="center-button">
            <button onClick={addProfessorRow} className="add-btn">
              Add Professor
            </button>
          </div>

          <div className="sop-output-section">
            <div className="sop-output-box">
              <h3 style={{ textAlign: "center" }}>SOP Recommendations</h3>
              <p style={{ whiteSpace: "pre-line" }}>
                {displayedSopOutput ||
                  "Your generated SOP will appear here once the process is complete."}
              </p>
            </div>
          </div>

          <section className="sop-section">
            <h2>Tell us how you want to refine your SOP</h2>
            <textarea
              value={sopRefinement}
              onChange={(e) => setSopRefinement(e.target.value)}
              placeholder="Enter your SOP refinement instructions..."
              className="sop-textarea"
            ></textarea>

            <div
              className={`dropzone ${dragOver ? "dragover" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() =>
                fileInputRef.current && fileInputRef.current.click()
              }
            >
              {sopFile ? (
                <p>{sopFile.name}</p>
              ) : (
                <p>Drag & drop your file here, or click to select a file</p>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileSelect}
            />

            <button onClick={handleGenerateSOP} className="generate-btn">
              Generate Recommendations
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}

export default SopGenerator;
