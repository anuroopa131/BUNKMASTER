import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import AttendanceManagement from './AttendanceManagement';
import UserManagement from './UserManagement';
import './Admin.css';
import Timetable from "./Timetable";

const AdminDashboard = () => {
  const [adminData, setAdminData] = useState(null);
  const [activeSection, setActiveSection] = useState('analytics');

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('adminData'));
    if (data) {
      setAdminData(data);
    }
  }, []);

  if (!adminData) {
    return <div>Loading admin data...</div>;
  }

  return (
    <div className="admin-container">
      <Sidebar setActiveSection={setActiveSection} />
      <div className="admin-content">
        <h1>Welcome back, Admin! Here's what's happening today.👋</h1>
        ⏰ Recent Activity:
          <ul>
<li> User "JohnDoe" signed up 2 hours ago</li>
<li>Order #1234 was placed 1 hour ago</li>
<li>Ticket #567 was resolved 30 minutes ago</li>
</ul>


   
        {activeSection === 'attendance' && <AttendanceManagement />}
        {activeSection === 'users' && <UserManagement users={adminData.users} />}
        {activeSection === "timetable" && <Timetable />}
      </div>
    </div>
  );
};

export default AdminDashboard;
