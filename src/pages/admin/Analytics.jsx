import React from 'react';
import './Admin.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const Analytics = ({ analyticsData }) => {
  // Sample data for charts
  const chartData = [
    { name: 'Jan', uv: 4000, pv: 2400, amt: 2400 },
    { name: 'Feb', uv: 3000, pv: 1398, amt: 2210 },
    { name: 'Mar', uv: 2000, pv: 9800, amt: 2290 },
    { name: 'Apr', uv: 2780, pv: 3908, amt: 2000 },
    { name: 'May', uv: 1890, pv: 4800, amt: 2181 },
    { name: 'Jun', uv: 2390, pv: 3800, amt: 2500 },
    { name: 'Jul', uv: 3490, pv: 4300, amt: 2100 },
  ];

  // Function to export data as JSON
  const exportData = () => {
    const dataStr = JSON.stringify(analyticsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'analytics-data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="section">
      <h2>📊 Analytics</h2>
      {analyticsData ? (
        <div>
          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="card">
              <h3>Total Users</h3>
              <p>{analyticsData.totalUsers}</p>
            </div>
            <div className="card">
              <h3>Active Users</h3>
              <p>{analyticsData.activeUsers}</p>
            </div>
            <div className="card">
              <h3>Revenue</h3>
              <p>${analyticsData.revenue}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="chart-container">
            <h3>User Activity</h3>
            <BarChart width={600} height={300} data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="pv" fill="#8884d8" />
              <Bar dataKey="uv" fill="#82ca9d" />
            </BarChart>
          </div>

          {/* Table */}
          <div className="table-container">
            <h3>Detailed Data</h3>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Users</th>
                  <th>Sessions</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.detailedData.map((row, index) => (
                  <tr key={index}>
                    <td>{row.date}</td>
                    <td>{row.users}</td>
                    <td>{row.sessions}</td>
                    <td>${row.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Export Button */}
          <button onClick={exportData} className="export-button">
            Export Data as JSON
          </button>
        </div>
      ) : (
        <p>No analytics data available.</p>
      )}
    </div>
  );
};

export default Analytics;