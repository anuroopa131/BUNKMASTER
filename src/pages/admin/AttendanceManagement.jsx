import React, { useState } from "react";
import "./Admin.css";

const timetableData = [
  {
    day: "Monday",
    subjects: [
      { time: "9:00 AM", subject: "Mathematics", teacher: "Mr. Smith", room: "Room 101" },
      { time: "10:00 AM", subject: "Physics", teacher: "Ms. Johnson", room: "Room 102" },
      { time: "11:00 AM", subject: "Chemistry", teacher: "Mr. White", room: "Room 105" },
      { time: "12:00 PM", subject: "English", teacher: "Ms. Green", room: "Room 106" },
      { time: "1:00 PM", subject: "History", teacher: "Mr. Brown", room: "Room 103" },
    ],
  },
  {
    day: "Tuesday",
    subjects: [
      { time: "9:00 AM", subject: "History", teacher: "Mr. Brown", room: "Room 103" },
      { time: "10:00 AM", subject: "Geography", teacher: "Ms. Davis", room: "Room 104" },
      { time: "11:00 AM", subject: "Mathematics", teacher: "Mr. Smith", room: "Room 101" },
      { time: "12:00 PM", subject: "Physics", teacher: "Ms. Johnson", room: "Room 102" },
      { time: "1:00 PM", subject: "Chemistry", teacher: "Mr. White", room: "Room 105" },
    ],
  },
  {
    day: "Wednesday",
    subjects: [
      { time: "9:00 AM", subject: "Chemistry", teacher: "Mr. White", room: "Room 105" },
      { time: "10:00 AM", subject: "Mathematics", teacher: "Mr. Smith", room: "Room 101" },
      { time: "11:00 AM", subject: "English", teacher: "Ms. Green", room: "Room 106" },
      { time: "12:00 PM", subject: "Geography", teacher: "Ms. Davis", room: "Room 104" },
      { time: "1:00 PM", subject: "Physics", teacher: "Ms. Johnson", room: "Room 102" },
    ],
  },
  {
    day: "Thursday",
    subjects: [
      { time: "9:00 AM", subject: "Geography", teacher: "Ms. Davis", room: "Room 104" },
      { time: "10:00 AM", subject: "History", teacher: "Mr. Brown", room: "Room 103" },
      { time: "11:00 AM", subject: "Physics", teacher: "Ms. Johnson", room: "Room 102" },
      { time: "12:00 PM", subject: "Mathematics", teacher: "Mr. Smith", room: "Room 101" },
      { time: "1:00 PM", subject: "Chemistry", teacher: "Mr. White", room: "Room 105" },
    ],
  },
  {
    day: "Friday",
    subjects: [
      { time: "9:00 AM", subject: "English", teacher: "Ms. Green", room: "Room 106" },
      { time: "10:00 AM", subject: "Chemistry", teacher: "Mr. White", room: "Room 105" },
      { time: "11:00 AM", subject: "Mathematics", teacher: "Mr. Smith", room: "Room 101" },
      { time: "12:00 PM", subject: "Geography", teacher: "Ms. Davis", room: "Room 104" },
      { time: "1:00 PM", subject: "History", teacher: "Mr. Brown", room: "Room 103" },
    ],
  },
];
const students = ["Alice", "Bob", "Charlie", "David", "Emma", "Frank", "Grace", "Henry", "Ivy", "Jack"];

const AttendanceManagement = () => {
  const [selectedDay, setSelectedDay] = useState(timetableData[0].day);

  // Initialize all students as "Present" by default
  const initializeAttendance = () => {
    const defaultAttendance = {};
    timetableData.forEach((day) => {
      defaultAttendance[day.day] = {};
      day.subjects.forEach((subject) => {
        defaultAttendance[day.day][subject.subject] = {};
        students.forEach((student) => {
          defaultAttendance[day.day][subject.subject][student] = "Present";
        });
      });
    });
    return defaultAttendance;
  };

  const [attendance, setAttendance] = useState(initializeAttendance);

  const toggleAttendance = (subject, student) => {
    setAttendance((prev) => ({
      ...prev,
      [selectedDay]: {
        ...prev[selectedDay],
        [subject]: {
          ...prev[selectedDay]?.[subject],
          [student]: prev[selectedDay]?.[subject]?.[student] === "Present" ? "Absent" : "Present",
        },
      },
    }));
  };

  return (
    <div className="section">
      <h2>📅 Attendance Management</h2>

      <label>Select Day:</label>
      <select onChange={(e) => setSelectedDay(e.target.value)} value={selectedDay}>
        {timetableData.map((day) => (
          <option key={day.day} value={day.day}>{day.day}</option>
        ))}
      </select>

      {timetableData.find((day) => day.day === selectedDay)?.subjects.map((subject) => (
        <div key={subject.time} className="subject-container">
          <h3>{subject.time} - {subject.subject} ({subject.teacher})</h3>
          <p>Room: {subject.room}</p>

          <div className="attendance-grid">
            {students.map((student) => (
              <div
                key={student}
                className={`grid-item ${
                  attendance[selectedDay]?.[subject.subject]?.[student] === "Present" ? "present" : "absent"
                }`}
                onClick={() => toggleAttendance(subject.subject, student)}
              >
                {student}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AttendanceManagement;
