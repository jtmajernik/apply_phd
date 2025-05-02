import React, { useState } from "react";
import "./Home.css";
import logo from "../assets/logo.png";
import pennLogo from "../assets/penn_logo.png"; // Add these images to your assets folder
import { FaUserCircle, FaSearch, FaTrashAlt, FaPlus } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import Joyride from "react-joyride";




const schoolDB = [
  // Ivy League
  {
    name: "Harvard University",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/0c/Harvard_University_shield.svg",
    checklist: { lor: false, sop: false, submitted: false }
  },
  {
    name: "Yale University",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6e/Yale_University_logo.svg",
    checklist: { lor: false, sop: false, submitted: false }
  },
  {
    name: "Princeton University",
    logo: "https://upload.wikimedia.org/wikipedia/commons/d/d0/Princeton_seal.svg",
    checklist: { lor: false, sop: false, submitted: false }
  },
  {
    name: "Columbia University",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/02/Columbia_Lions_wordmark.png",
    checklist: { lor: false, sop: false, submitted: false }
  },
  {
    name: "University of Pennsylvania",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Penn_Quakers_logo.svg",
    checklist: { lor: false, sop: false, submitted: false }
  },
  {
    name: "Dartmouth College",
    logo: "https://communications.dartmouth.edu/sites/communications/files/2024-07/d-pine-and-wordmark_2.jpg",
    checklist: { lor: false, sop: false, submitted: false }
  },
  {
    name: "Brown University",
    // fixed
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a1/Brown_University_logo.svg",
    checklist: { lor: false, sop: false, submitted: false }
  },
  {
    name: "Cornell University",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/9d/Cornell_%22C%22_logo.svg",
    checklist: { lor: false, sop: false, submitted: false }
  },

  // Top CS PhD Programs
  {
    name: "Massachusetts Institute of Technology",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/0c/MIT_logo.svg",
    checklist: { lor: false, sop: false, submitted: false }
  },
  {
    name: "Stanford University",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Stanford_Cardinal_logo.svg",
    checklist: { lor: false, sop: false, submitted: false }
  },
  {
    name: "Carnegie Mellon University",
    // fixed
    logo: "https://www.drupal.org/files/CMU_Logo_Stack_Red.png",
    checklist: { lor: false, sop: false, submitted: false }
  },
  {
    name: "University of California, Berkeley",
    // fixed
    logo: "https://upload.wikimedia.org/wikipedia/commons/8/82/University_of_California%2C_Berkeley_logo.svg",
    checklist: { lor: false, sop: false, submitted: false }
  },
  {
    name: "University of Illinois Urbana-Champaign",
    // fixed
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/9c/University_of_Illinois_at_Urbana%E2%80%93Champaign_logo.svg",
    checklist: { lor: false, sop: false, submitted: false }
  },
  {
    name: "University of Washington",
    // fixed
    logo: "https://upload.wikimedia.org/wikipedia/commons/3/36/University_of_Washington_Purple_Block_W_logo.svg",
    checklist: { lor: false, sop: false, submitted: false }
  },
  {
    name: "Georgia Institute of Technology",
    // fixed
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/bf/Georgia_Tech_Yellow_Jackets_logo.svg",
    checklist: { lor: false, sop: false, submitted: false }
  },
  {
    name: "University of Michigan, Ann Arbor",
    // fixed
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/fb/Michigan_Wolverines_logo.svg",
    checklist: { lor: false, sop: false, submitted: false }
  },
  {
    name: "University of California, San Diego",
    // fixed
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/ff/UC_San_Diego_Tritons_wordmark.svg",
    checklist: { lor: false, sop: false, submitted: false }
  },
  {
    name: "University of Southern California",
    // fixed
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/94/USC_Trojans_logo.svg",
    checklist: { lor: false, sop: false, submitted: false }
  },
  {
    name: "University of Texas at Austin",
    // fixed
    logo: "https://upload.wikimedia.org/wikipedia/commons/8/8d/Texas_Longhorns_logo.svg",
    checklist: { lor: false, sop: false, submitted: false }
  },
  {
    name: "University of Wisconsin–Madison",
    // fixed
    logo: "https://upload.wikimedia.org/wikipedia/commons/e/e5/Wisconsin_Badgers_logo.svg",
    checklist: { lor: false, sop: false, submitted: false }
  }
];



function Home() {
  const [schools, setSchools] = useState(() => {
    const saved = localStorage.getItem("savedSchools");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((school) => ({
          ...school,
          checklist: {
            lor: school.checklist?.lor || false,
            sop: school.checklist?.sop || false,
            submitted: school.checklist?.submitted || false
          }
        }));
      } catch (e) {
        console.error("Invalid saved data:", e);
        return [];
      }
    }
    return [];
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [tutorialActive, setTutorialActive] = useState(false);
  const [tutorialPartTwoActive, setTutorialPartTwoActive] = useState(false);

  const location = useLocation();

  React.useEffect(() => {
    if (location.state?.showTutorial) {
      setTutorialActive(true);
    }
  }, [location]);

  const tutorialPartOne = [
    {
      target: '.top-bar-logo',
      content: 'This is the logo that takes you back to the homepage.',
    },
    {
      target: '.top-bar-profile-link',
      content: 'Click here to edit your profile.',
    },
    {
      target: '.search-bar',
      content: 'Use this search bar to filter your added schools.',
    },
    {
      target: '.add-school input',
      content: 'Type the name of a school here to add it to your list.',
    },
    {
      target: '.reset-section button',
      content: 'Click here to reset your saved schools.',
    },
  ];

  const tutorialPartTwo = [
    {
      target: '.sop-button',
      content: 'Click here to access the SOP Maker to help with your application essays.',
    },
  ];

  const handleAddSchool = () => {
    const trimmedSearch = searchTerm.trim();
    if (!trimmedSearch) {
      alert("Please enter a school name.");
      return;
    }

    const matches = schoolDB.filter(
      (s) => s.name.toLowerCase().includes(trimmedSearch.toLowerCase())
    );
    const found = matches.find((s) => !schools.find((added) => added.name === s.name));
    if (found) {
      const updated = [...schools, found];
      setSchools(updated);
      localStorage.setItem("savedSchools", JSON.stringify(updated));
      // If this is the first school being added, trigger the SOP Tool tutorial (Part Two)
      if (schools.length === 0) {
        setTutorialPartTwoActive(true);
      }
    } else {
      alert("School not found in the system.");
    }
    setSearchTerm("");
  };

  const handleDeleteSchool = (name) => {
    const updated = schools.filter((s) => s.name !== name);
    setSchools(updated);
    localStorage.setItem("savedSchools", JSON.stringify(updated));
  };

  const handleToggleChecklistItem = (schoolName, item) => {
    const updated = schools.map((school) => {
      if (school.name === schoolName) {
        return {
          ...school,
          checklist: {
            ...school.checklist,
            [item]: !school.checklist[item]
          }
        };
      }
      return school;
    });
    setSchools(updated);
    localStorage.setItem("savedSchools", JSON.stringify(updated));
  };

  const handleResetSchools = () => {
    localStorage.removeItem("savedSchools");
    setSchools([]);
  };

  const availableSchools = schoolDB.filter(
    (school) => !schools.find((added) => added.name === school.name)
  );

  const handleAddAvailableSchool = (school) => {
    if (!schools.find((s) => s.name === school.name)) {
      const updated = [...schools, school];
      setSchools(updated);
      localStorage.setItem("savedSchools", JSON.stringify(updated));
    }
  };

  return (
    <div className="home-page">
      {tutorialActive && (
        <Joyride
          steps={tutorialPartOne}
          run={tutorialActive}
          continuous={true}
          showSkipButton={true}
          callback={(data) => {
            const { status } = data;
            if (status === 'finished' || status === 'skipped') {
              setTutorialActive(false);
              // If there are any schools added (and thus the SOP tool is visible), trigger Part Two of the tutorial
              if (schools.length > 0) {
                setTutorialPartTwoActive(true);
              }
            }
          }}
        />
      )}
      {tutorialPartTwoActive && (
        <Joyride
          steps={tutorialPartTwo}
          run={tutorialPartTwoActive}
          continuous={true}
          showSkipButton={true}
          callback={(data) => {
            const { status } = data;
            if (status === 'finished' || status === 'skipped') {
              setTutorialPartTwoActive(false);
            }
          }}
        />
      )}
      {/* Top Bar */}
      <header className="top-bar">
        <Link to="/" onClick={() => setSearchFilter("")}>
          <img src={logo} alt="ApplyPhD logo" className="top-bar-logo" />
        </Link>
        <Link to="/profile" className="top-bar-profile-link">
          <div className="top-bar-profile">
            <FaUserCircle className="profile-icon" />
            <span>Edit Profile</span>
          </div>
        </Link>
      </header>

      {/* Main Content */}
      <main className="home-content">
        <div className="section-header">
          <div className="header-left" style={{ display: 'flex', alignItems: 'center' }}>
            <h2>Schools List</h2>
            <button
            className="tutorial-button"
              onClick={() => setTutorialActive(true)}
              style={{ marginLeft: '1rem', padding: '0.5rem 1rem' }}
            >
              Show Tutorial
            </button>
          </div>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search Added Schools"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
          </div>
        </div>

        {/* School Cards */}
        {schools
            .filter((school) =>
                school.name.toLowerCase().includes(searchFilter.toLowerCase())
            )
            .map((school, index) => (
                <div className="school-card" key={index}>
                  <img src={school.logo} alt={`${school.name} logo`} className="school-logo"/>
                  <div className="school-info">
                    <h3>{school.name}</h3>
                    <p><strong>Application Progress</strong></p>
                    <label className="lor-entry">
                      <input
                        type="checkbox"
                        checked={school.checklist?.lor}
                        onChange={() => handleToggleChecklistItem(school.name, "lor")}
                      />
                      Letters of Recommendation
                    </label>
                    <label className="lor-entry">
                      <input
                        type="checkbox"
                        checked={school.checklist?.sop}
                        onChange={() => handleToggleChecklistItem(school.name, "sop")}
                      />
                      Statement of Purpose
                    </label>
                    <label className="lor-entry">
                      <input
                        type="checkbox"
                        checked={school.checklist?.submitted}
                        onChange={() => handleToggleChecklistItem(school.name, "submitted")}
                      />
                      Application Submitted
                    </label>
                  </div>
                  <div className="school-actions">
                    <Link to="/sop" className="sop-button-link">
                      <button className="sop-button">SOP Tool</button>
                    </Link>
                    <FaTrashAlt className="delete-icon" onClick={() => handleDeleteSchool(school.name)}/>
                  </div>
                </div>
            ))}

        {/* Add School Section */}
        <div className="add-school">
          <input
              type="text"
              placeholder="Enter School Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={handleAddSchool}>Add School</button>
        </div>
        <div className="reset-section">
          <button onClick={handleResetSchools}>Reset All Schools</button>
        </div>

        {availableSchools.length > 0 && (
          <div className="available-schools-section">
            <h2>Available Schools</h2>
            <div className="available-schools">
              {availableSchools.map((school, idx) => (
                <div className="school-card" key={`available-${idx}`}>
                  <img src={school.logo} alt={`${school.name} logo`} className="school-logo" />
                  <div className="school-info">
                    <h3>{school.name}</h3>
                    <p>Track your application progress</p>
                  </div>
                  <div className="school-actions">
                    <button onClick={() => handleAddAvailableSchool(school)}><FaPlus/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Home;
