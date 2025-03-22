import React from "react";
import "./Admin.css";

const students = [
  { name: "Alice Johnson", email: "alice@example.com", rollNo: "101", class: "10A" },
  { name: "Bob Smith", email: "bob@example.com", rollNo: "102", class: "10A" },
  { name: "Charlie Brown", email: "charlie@example.com", rollNo: "103", class: "10A" },
  { name: "David Lee", email: "david@example.com", rollNo: "104", class: "10A" },
  { name: "Emma Wilson", email: "emma@example.com", rollNo: "105", class: "10A" },
  { name: "Frank Thomas", email: "frank@example.com", rollNo: "106", class: "10A" },
  { name: "Grace Hall", email: "grace@example.com", rollNo: "107", class: "10A" },
  { name: "Henry White", email: "henry@example.com", rollNo: "108", class: "10A" },
  { name: "Ivy Adams", email: "ivy@example.com", rollNo: "109", class: "10A" },
  { name: "Jack King", email: "jack@example.com", rollNo: "110", class: "10A" },
];

const UserManagement = () => {
  return (
    <div className="section">
      <h2>👥 Student List</h2>
      <table>
        <thead>
          <tr>
            <th>Roll No</th>
            <th>Name</th>
            <th>Email</th>
            <th>Class</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.rollNo}>
              <td>{student.rollNo}</td>
              <td>{student.name}</td>
              <td>{student.email}</td>
              <td>{student.class}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;
