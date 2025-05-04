import React, { useState, useRef, useEffect } from "react";
import "./SopGenerator.css";
import logo from "../assets/logo.png";
import { FaUserCircle } from "react-icons/fa";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import {Link, useNavigate} from "react-router-dom";
import { useLocation } from "react-router-dom";
import Joyride from "react-joyride"; // Added import for Joyride
import Papa from "papaparse";
import professorCSV from "../professors_final_combined2.csv"; // Make sure it's placed under /src/assets
import ReactMarkdown from 'react-markdown';

// Set the worker for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

function SopGenerator() {
  const location = useLocation();
  const schoolName = location.state?.schoolName || "Default School";
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const [professorsData, setProfessorsData] = useState(() => {
    // Try to get saved professor data from localStorage
    const savedProfessors = localStorage.getItem(`professors_${schoolName}`);
    if (savedProfessors) {
      try {
        // Parse the saved data and use it as initial state
        return JSON.parse(savedProfessors);
      } catch (e) {
        console.error("Error parsing saved professors:", e);
      }
    }
    
    // Default state if nothing is saved
    return [{
      id: Date.now(),
      name: "",
      researchInterests: [],
      program: "CIS PhD",
      interviewSent: "Not Sure",
      personalWebsite: "",
    }];
  });

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

const [professorOptions, setProfessorOptions] = useState([]);

// Add a state to track when localStorage changes
const [userProfileVersion, setUserProfileVersion] = useState(0);

// Use useEffect to check localStorage periodically
useEffect(() => {
  // Check localStorage values periodically to see if they've changed
  const checkUserProfile = () => {
    const currentInterests = localStorage.getItem("profile_interests") || "";
    const currentResearch = localStorage.getItem("profile_research") || "";
    const currentEducation = localStorage.getItem("profile_education") || "";
    
    // Create a checksum to detect changes
    const profileChecksum = `${currentInterests.length}-${currentResearch.length}-${currentEducation.length}`;
    
    // Store checksum in component's state
    if (profileChecksum !== profileChecksumRef.current) {
      profileChecksumRef.current = profileChecksum;
      setUserProfileVersion(prev => prev + 1);
    }
  };

  // Check immediately when component mounts
  checkUserProfile();
  
  // Also check when tab/window becomes active again
  window.addEventListener('focus', checkUserProfile);
  
  return () => {
    window.removeEventListener('focus', checkUserProfile);
  };
}, []);

// Create a ref to store the checksum
const profileChecksumRef = useRef("");

// Update useEffect for fetching professors to depend on userProfileVersion
useEffect(() => {
  fetch(professorCSV)
    .then((response) => response.text())
    .then((csvText) => {
      const result = Papa.parse(csvText, { header: true });
      const filtered = result.data
        .filter((row) => row.school === schoolName && row.professor_name)
        .map((row) => ({
          name: row.professor_name,
          researchInterests: row.research_interests || "",
          personalWebsite: row.personal_website || "",
          matchScore: 0,
        }));
      
      // Calculate similarity scores and sort professors
      const rankedProfessors = rankProfessorsByInterestSimilarity(filtered);
      setProfessorOptions(rankedProfessors);
      
      // Add debugging to see what's happening
      console.log("User profile data:", {
        interests: localStorage.getItem("profile_interests"),
        research: localStorage.getItem("profile_research"),
        education: localStorage.getItem("profile_education")
      });
      console.log("Top 5 recommended professors:", rankedProfessors.slice(0, 5).map(p => ({
        name: p.name,
        score: p.matchScore,
        interests: p.researchInterests
      })));
    })
    .catch((error) => {
      console.error("Failed to load professor CSV:", error);
      setProfessorOptions([]);
    });
}, [schoolName, userProfileVersion]); // Added userProfileVersion dependency

// Function to calculate similarity between two text strings
const calculateSimilarity = (text1, text2) => {
  if (!text1 || !text2) return 0;
  
  // Normalize texts - lowercase, remove extra spaces
  const normalizedText1 = text1.toLowerCase().replace(/\s+/g, ' ').trim();
  const normalizedText2 = text2.toLowerCase().replace(/\s+/g, ' ').trim();
  
  // Convert to lowercase and tokenize by splitting on non-alphanumeric characters
  const tokens1 = normalizedText1.split(/\W+/).filter(token => token.length > 2);
  const tokens2 = normalizedText2.split(/\W+/).filter(token => token.length > 2);
  
  // Create sets of unique words
  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);
  
  // Find intersection (common words)
  const intersection = new Set([...set1].filter(word => set2.has(word)));
  
  // Calculate Jaccard similarity coefficient: size of intersection / size of union
  const union = new Set([...set1, ...set2]);
  
  // Weight longer matches more heavily and account for domain-specific keywords
  let extraScore = 0;
  
  // Generate n-grams for better phrase matching
  const bigrams1 = [];
  const trigrams1 = [];
  
  // Generate bi-grams and tri-grams from text1
  for (let i = 0; i < tokens1.length - 1; i++) {
    const bigram = tokens1[i] + ' ' + tokens1[i+1];
    bigrams1.push(bigram);
    
    if (i < tokens1.length - 2) {
      const trigram = tokens1[i] + ' ' + tokens1[i+1] + ' ' + tokens1[i+2];
      trigrams1.push(trigram);
    }
  }
  
  // Check for bigram and trigram matches in text2
  for (const bigram of bigrams1) {
    if (normalizedText2.includes(bigram)) {
      extraScore += 0.1; // Boost for matching bigrams
    }
  }
  
  for (const trigram of trigrams1) {
    if (normalizedText2.includes(trigram)) {
      extraScore += 0.2; // Higher boost for matching trigrams
    }
  }
  
  // List of important research keywords that should get extra weight if matched
  const importantKeywords = [
    'machine learning', 'artificial intelligence', 'computer vision', 
    'natural language processing', 'human-computer interaction', 'hci',
    'data science', 'robotics', 'systems', 'algorithms', 'security',
    'networks', 'database', 'distributed systems', 'quantum computing'
  ];
  
  // Check for important keywords in both texts
  for (const keyword of importantKeywords) {
    if (normalizedText1.includes(keyword) && normalizedText2.includes(keyword)) {
      extraScore += 0.15; // Significant boost for matching important keywords
    }
  }
  
  if (union.size === 0) return 0;
  
  // Base similarity score + extra score from phrases and keywords
  return (intersection.size / union.size) + extraScore;
};

const rankProfessorsByInterestSimilarity = (professors) => {
  // Get user interests and research from localStorage
  const userInterests = localStorage.getItem("profile_interests") || "";
  const userResearch = localStorage.getItem("profile_research") || "";
  const userEducation = localStorage.getItem("profile_education") || "";
  
  // Combine all user profile information for better matching
  const userProfile = `${userInterests} ${userResearch} ${userEducation}`;
  
  if (!userProfile.trim()) {
    console.log("No user profile information for recommendations");
    return professors; // Return original list if no user data
  }
  
  // Calculate similarity scores for each professor
  const scoredProfessors = professors.map(prof => {
    const similarityScore = calculateSimilarity(userProfile, prof.researchInterests);
    return {
      ...prof,
      matchScore: similarityScore
    };
  });
  
  // Sort by match score (highest first)
  scoredProfessors.sort((a, b) => b.matchScore - a.matchScore);
  
  return scoredProfessors;
};

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
    const selected = professorOptions.find((prof) => prof.name === value);
    setProfessorsData((prev) =>
      prev.map((prof) =>
        prof.id === id
          ? {
              ...prof,
              name: value,
              researchInterests:
                selected?.researchInterests?.split(",").map(s => s.trim()).filter(Boolean) || [],
              personalWebsite: selected?.personalWebsite || "",
            }
          : prof
      )
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
      personalWebsite: "",
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

  // Create the ref at the component level
  const currentTextRef = useRef("");

  // Then modify the typewriter effect function
  const typeWriterEffect = (fullText) => {
    // Reset the displayed text
    setDisplayedSopOutput("");
    currentTextRef.current = "";
    
    // If text is empty, exit early
    if (!fullText || fullText.length === 0) return;
    
    // Set a faster typing speed (lower number = faster)
    const typingSpeed = 5; // milliseconds per character
    
    let index = 0;
    
    // Clear any existing interval to avoid multiple running typewriters
    if (window.typewriterInterval) {
      clearInterval(window.typewriterInterval);
    }
    
    // Start a new interval
    window.typewriterInterval = setInterval(() => {
      if (index < fullText.length) {
        // Add the next character to our accumulated text
        currentTextRef.current += fullText.charAt(index);
        // Update the state with the new accumulated text
        setDisplayedSopOutput(currentTextRef.current);
        index++;
      } else {
        // When we're done, clear the interval
        clearInterval(window.typewriterInterval);
        window.typewriterInterval = null;
      }
    }, typingSpeed);
  };

  // Modify the handleGenerateSOP function to use the typewriter effect
  const handleGenerateSOP = async () => {
    setLoading(true);
    try {
      // Get SOP file content
      let fileContent = "";
      if (sopFile) {
        fileContent = await extractPDFText(sopFile);
      }

      // Get user profile data from localStorage
      const userEducation = localStorage.getItem("profile_education") || "";
      const userResearch = localStorage.getItem("profile_research") || "";
      const userExperience = localStorage.getItem("profile_experience") || "";
      const userSkills = localStorage.getItem("profile_skills") || "";
      const userInterests = localStorage.getItem("profile_interests") || "";
      const userAdditional = localStorage.getItem("profile_additional") || "";

      // Get selected professors' information
      const selectedProfessors = professorsData
        .filter(prof => prof.name) // Only include professors with names (i.e., selected professors)
        .map(prof => ({
          name: prof.name,
          researchInterests: prof.researchInterests.join(", "),
          personalWebsite: prof.personalWebsite || "None",
        }));

      // Create context for the prompt
      const userProfileContext = `
        ## User Profile Information
        
        ### Education:
        ${userEducation}
        
        ### Research Experience:
        ${userResearch}
        
        ### Work Experience:
        ${userExperience}
        
        ### Skills:
        ${userSkills}
        
        ### Interests:
        ${userInterests}
        
        ### Additional Information:
        ${userAdditional}
      `;

      const professorsContext = selectedProfessors.length > 0 
        ? `
          ## Selected Professors Information
          
          ${selectedProfessors.map(prof => `
            ### ${prof.name}
            Research Interests: ${prof.researchInterests}
            Personal Website: ${prof.personalWebsite}
          `).join('\n\n')}
        `
        : "No professors selected yet.";

      // Combine everything into a single prompt
      const prompt = `
        You are an expert advisor for PhD applications. Your task is to provide tailored SOP (Statement of Purpose) recommendations based on:
        
        1) The user's profile information
        2) The selected professors' research areas
        3) The user's SOP draft
        4) The user's specific refinement instructions
        
        ${userProfileContext}
        
        ${professorsContext}
        
        ## User's SOP Refinement Instructions:
        ${sopRefinement}
        
        ## User's Current SOP Draft:
        ${fileContent}
        
        ## Your Task:
        
        Provide specific, actionable recommendations to improve the SOP. Make it more tailored to the selected professors' research interests while highlighting relevant aspects of the user's background.
        
        For each professor, provide:
        1. Key points to emphasize that align with that professor's research
        2. Specific connections between the user's background and the professor's work
        3. How to frame research interests to show genuine interest in their work
        
        Also provide general improvements for structure, clarity, and impact.
        
        IMPORTANT FORMATTING INSTRUCTIONS:
        - Use proper Markdown formatting in your response
        - Format professor sections with level 2 headings like: ## Recommendations for [Professor Name]
        - Use numbered lists for specific recommendations
        - Make important points, keywords, or phrases **bold** for emphasis
        - Include a level 2 heading ## General Recommendations at the end
        - Structure your response for maximum readability with clear sections
        
        If multiple professors are selected, organize your recommendations by professor name.
      `;

      // Call OpenAI API
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
            temperature: 0.3, // Slightly higher temperature for more creative recommendations
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("OpenAI API Error:", errorData);
        throw new Error("Failed to generate SOP recommendations");
      }

      const data = await response.json();
      const generatedText = data?.choices?.[0]?.message?.content || "";
      setSopOutput(generatedText);
      
      // Use the typewriter effect again
      typeWriterEffect(generatedText);
    } catch (error) {
      console.error("Error generating SOP:", error);
      alert("There was an error generating your SOP recommendations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Add a cleanup effect to ensure the interval is cleared when component unmounts
  useEffect(() => {
    return () => {
      if (window.typewriterInterval) {
        clearInterval(window.typewriterInterval);
        window.typewriterInterval = null;
      }
    };
  }, []);

  // Add a new useEffect to save professor data whenever it changes
  useEffect(() => {
    // Save professorsData to localStorage whenever it changes
    localStorage.setItem(`professors_${schoolName}`, JSON.stringify(professorsData));
  }, [professorsData, schoolName]);

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
          <div style={{ marginLeft: 'auto', fontSize: '0.9rem', color: '#666', maxWidth: '400px' }}>
            Professor recommendations are based on your profile interests. Update your profile to see new recommendations.
          </div>
        </div>
        <table className="professor-table">
          <thead>
            <tr>
              <th>Professor</th>
              <th>Personal Website</th>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                    <select
                      value={row.name}
                      onChange={(e) => handleProfessorNameChange(row.id, e.target.value)}
                      className="beautiful-select"
                    >
                      <option value="">Select a Professor</option>
                      
                      {/* Group professors by relevance */}
                      <optgroup label="Recommended Based on Your Interests">
                        {professorOptions.slice(0, 5).map((option) => (
                          <option key={option.name} value={option.name}>
                            {option.name} {option.matchScore > 0.3 ? "★★★" : option.matchScore > 0.2 ? "★★" : option.matchScore > 0.1 ? "★" : ""}
                          </option>
                        ))}
                      </optgroup>
                      
                      {professorOptions.length > 5 && (
                        <optgroup label="Other Professors">
                          {professorOptions.slice(5).map((option) => (
                            <option key={option.name} value={option.name}>
                              {option.name}
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>
                </td>
                <td>
                  <div style={{ padding: '8px' }}>
                    {row.personalWebsite ? (
                      <a href={row.personalWebsite} target="_blank" rel="noopener noreferrer">
                        Website
                      </a>
                    ) : ""}
                  </div>
                </td>
                <td>
                  <div style={{ padding: '8px' }}>
                    {row.researchInterests.length > 0 ? row.researchInterests.join(", ") : ""}
                  </div>
                </td>
                <td>
                  <div style={{ padding: '8px' }}>
                    {row.name ? row.program : ""}
                  </div>
                </td>
                <td>
                  <div style={{ padding: '8px' }}>
                    {row.name ? row.interviewSent : ""}
                  </div>
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
              {displayedSopOutput ? (
                <ReactMarkdown>{displayedSopOutput}</ReactMarkdown>
              ) : (
                <p>Your generated SOP will appear here once the process is complete.</p>
              )}
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
