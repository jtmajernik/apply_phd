import React, { useState } from "react";
import "./SopGenerator.css";
import logo from "../assets/logo.png";
import { FaUserCircle, FaDownload } from "react-icons/fa";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import { useNavigate } from "react-router-dom";

// Set the worker for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

function SopGenerator() {
  const navigate = useNavigate();

  const [professorsData, setProfessorsData] = useState([
    {
      id: Date.now(),
      name: "",
      researchInterests: [],
      program: "CIS PhD",
      interviewSent: "Not Sure",
    },
  ]);

  const [sopRefinement, setSopRefinement] = useState("");
  const [sopFile, setSopFile] = useState(null);
  const [sopOutput, setSopOutput] = useState("");
  const [loading, setLoading] = useState(false); // 🌀 Spinner state

  const professorOptions = ["Andrew Head", "Danaë Metaxa", "Chris Callison-Burch"];
  const researchInterestOptions = [
    "HCI",
    "Programming",
    "Reading",
    "Bias and representation in algorithmic systems",
  ];

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
      researchInterests: [],
      program: "CIS PhD",
      interviewSent: "Not Sure",
    };
    setProfessorsData((prev) => [...prev, newRow]);
  };

  const removeProfessorRow = (id) => {
    setProfessorsData((prev) => prev.filter((prof) => prof.id !== id));
  };

  const handleSopFileChange = (e) => {
    setSopFile(e.target.files[0]);
  };

  // Extract PDF text using pdf.js
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

  const handleGenerateSOP = async () => {
    setLoading(true); // Show spinner

    try {
      let fileContent = "";
      if (sopFile) {
        fileContent = await extractPDFText(sopFile);
      }

      const prompt = `
        Refine my SOP based on the instructions:
        ${sopRefinement}

        Here is my current SOP draft:
        ${fileContent}
        Review the SOP and provide a list of specific changes that I can make to improve my SOP based on the instructions. After each piece of advice, include a line break.
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
        const errorData = await response.json().catch(() => ({}));
        console.error("OpenAI API Error:", errorData);
        throw new Error("Failed to generate SOP");
      }

      const data = await response.json();
      const generatedText = data?.choices?.[0]?.message?.content || "";
      setSopOutput(generatedText);
    } catch (error) {
      console.error("Error generating SOP:", error);
      alert("There was an error generating your SOP. Please try again.");
    } finally {
      setLoading(false); // Hide spinner
    }
  };

  return (
    <div className="sop-page">
      {/* Spinner */}
      {loading && (
        <div className="spinner-overlay">
          <div className="spinner" />
          <p>Reviewing SOP...</p>
        </div>
      )}

      {/* Top Bar */}
      <header className="top-bar">
        <div className="top-bar-left">
          <img src={logo} alt="Logo" className="top-bar-logo" onClick={() => navigate("/")} />
        </div>
        <div className="top-bar-profile">
          <FaUserCircle className="profile-icon" />
          <span>Edit Profile</span>
        </div>
      </header>

      <main className="sop-main">
        <h1>Professor Details</h1>
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
                    onChange={(e) => handleProfessorNameChange(row.id, e.target.value)}
                    className="beautiful-select"
                  >
                    <option value="">Select a Professor</option>
                    {professorOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    multiple
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
                      <option key={interest} value={interest}>{interest}</option>
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
                    onChange={(e) => handleInterviewSentChange(row.id, e.target.value)}
                    className="beautiful-select"
                  >
                    <option value="Not Sure">Not Sure</option>
                    <option value="Yes">Yes</option>
                  </select>
                </td>
                <td>
                  <button className="delete-btn" onClick={() => removeProfessorRow(row.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={addProfessorRow} className="add-btn">Add Professor</button>

        <section className="sop-section">
          <h2>Tell us how you want to refine your SOP</h2>
          <textarea
            value={sopRefinement}
            onChange={(e) => setSopRefinement(e.target.value)}
            placeholder="Enter your SOP refinement instructions..."
            className="sop-textarea"
          ></textarea>

          <div className="sop-upload">
            <label className="file-label">Upload your current SOP draft:</label>
            <input type="file" onChange={handleSopFileChange} className="file-input" />
          </div>

          <button onClick={handleGenerateSOP} className="generate-btn">Generate SOP</button>
        </section>

        <div className="sop-output-section">
          <div className="sop-output-box">
            <h3>SOP Recommendations</h3>
            <p>{sopOutput || "Your generated SOP will appear here once the process is complete."}</p>
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
