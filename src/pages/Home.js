import React, { useState } from "react";
import "./Home.css";
import logo from "../assets/logo.png";
import pennLogo from "../assets/penn_logo.png"; // Add these images to your assets folder
import { FaUserCircle, FaSearch, FaTrashAlt, FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";

const steps = [
  {
    target: '.top-bar-logo',
    content: 'This is the logo that takes you back to the homepage.',
  },
  {
    target: '.sop-button',
    content: 'Click here to access the SOP Maker to help with your application essays.',
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

const schoolDB = [
  {
    name: "University Of Pennsylvania",
    logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Penn_Quakers_logo.svg',
    lor: [
      { name: "Prof. Andrew Head", sent: false },
      { name: "Prof. Danae Metaxa", sent: false },
      { name: "Prof. Chris Callison-Burch", sent: false }
    ],
  },
  {
    name: "Princeton University",
    logo: "https://upload.wikimedia.org/wikipedia/commons/d/d0/Princeton_seal.svg",
    lor: [
      { name: "Prof. Clara Thompson", sent: false },
      { name: "Prof. David Nguyen", sent: false }
    ],
  },
  {
    name: "Harvard University",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/0c/Harvard_University_shield.svg",
    lor: [
      { name: "Prof. Emily Chen", sent: false },
      { name: "Prof. Felix Moore", sent: false }
    ],
  },
  {
    name: "Stanford University",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Stanford_Cardinal_logo.svg",
    lor: [
      { name: "Prof. Grace Wang", sent: false },
      { name: "Prof. Henry Patel", sent: false }
    ],
  },
  {
    name: "MIT",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/0c/MIT_logo.svg",
    lor: [
      { name: "Prof. Irene Kim", sent: false },
      { name: "Prof. James Park", sent: false }
    ],
  },
  {
    name: "Columbia University",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/02/Columbia_Lions_wordmark.png",
    lor: [
      { name: "Prof. Robert Smith", sent: false },
      { name: "Prof. Sarah Connor", sent: false }
    ]
  },
  {
    name: "Yale University",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6e/Yale_University_logo.svg",
    lor: [
      { name: "Prof. Michael Johnson", sent: false },
      { name: "Prof. Linda White", sent: false }
    ]
  },
  {
    name: "Cornell University",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/9d/Cornell_%22C%22_logo.svg",
    lor: [
      { name: "Prof. William Brown", sent: false },
      { name: "Prof. Emma Davis", sent: false }
    ]
  }
];

function Home() {
  const [schools, setSchools] = useState(() => {
    const saved = localStorage.getItem("savedSchools");
    return saved ? JSON.parse(saved) : schoolDB.slice(0, 0);
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFilter, setSearchFilter] = useState("");

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

  const handleToggleLorStatus = (schoolName, index) => {
    const updated = schools.map((school) => {
      if (school.name === schoolName) {
        const newLor = [...school.lor];
        newLor[index].sent = !newLor[index].sent;
        return { ...school, lor: newLor };
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
          <h2>Schools List</h2>
          <div className="search-bar">
            <input
                type="text"
                placeholder="Search"
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
                    <p><strong>Letters of Recommendation</strong></p>
                    {school.lor.map((ref, i) => (
                        <label key={i} className="lor-entry">
                          <input
                              type="checkbox"
                              checked={ref.sent}
                              onChange={() => handleToggleLorStatus(school.name, i)}
                          />
                          {ref.name} — {ref.sent ? "sent ✅" : "unsent ⬛"}
                        </label>
                    ))}
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
                    <p>{school.lor.length} Letters of Recommendation</p>
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
