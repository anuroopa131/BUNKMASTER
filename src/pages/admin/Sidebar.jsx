import React from "react";
import { useNavigate } from "react-router-dom";
import "./Admin.css";

const Sidebar = ({ setActiveSection }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminData");
    navigate("/login");
  };

  return (
    <div className="sidebar">
      <h2>BunkMaster Admin</h2>
      <ul>
         <li onClick={() => setActiveSection("timetable")}>📅 Timetable</li>
        <li onClick={() => setActiveSection("attendance")}>📅 Attendance</li>
        <li onClick={() => setActiveSection("users")}>👥 User Management</li>
      </ul>
      <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
    </div>
  );
};

export default Sidebar;
