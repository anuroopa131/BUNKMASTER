import React, { useEffect, useState } from 'react';

const AdminDashboard = () => {
  const [adminData, setAdminData] = useState(null);

  useEffect(() => {
    // Fetch admin data from localStorage
    const data = JSON.parse(localStorage.getItem('adminData'));
    if (data) {
      setAdminData(data);
    }
  }, []);

  if (!adminData) {
    return <div>Loading admin data...</div>;
  }

  return (
    <div>
      <h1>Welcome, {adminData.name}</h1>
      <h2>Admin Dashboard</h2>
      {/* Display admin data */}
      <div>
        <h3>Analytics</h3>
        <pre>{JSON.stringify(adminData.analytics, null, 2)}</pre>
      </div>
      <div>
        <h3>User Management</h3>
        <pre>{JSON.stringify(adminData.users, null, 2)}</pre>
      </div>
    </div>
  );
};

export default AdminDashboard;