import React from "react";
import Welcome from "./pages/Welcome";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import your pages
import Home from "./pages/Home";
import UserProfile from "./pages/UserProfile";
import SopGenerator from "./pages/SopGenerator";

function App() {
  return (
    <Router>
      {/* If you want a nav bar, you can add it here (optional). */}
      {/* Example: <NavBar /> */}

      <Routes>
        {/* The route path "/" points to the Home component */}
        <Route path="/" element={<Home />} />

        <Route path="/welcome" element={<Welcome />} />

        {/* Route for user profile */}
        <Route path="/profile" element={<UserProfile />} />

        {/* Route for SOP generator */}
        <Route path="/sop" element={<SopGenerator />} />
      </Routes>
    </Router>
  );
}

export default App;
