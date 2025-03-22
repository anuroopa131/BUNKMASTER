import React from "react";
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

const Timetable = () => {
  return (
    <div className="timetable-container">
      <h2>📅 Weekly Timetable</h2>
      {timetableData.map((day) => (
        <div key={day.day} className="day-section">
          <h3>{day.day}</h3>
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Subject</th>
                <th>Teacher</th>
                <th>Room</th>
              </tr>
            </thead>
            <tbody>
              {day.subjects.map((subject, index) => (
                <tr key={index}>
                  <td>{subject.time}</td>
                  <td>{subject.subject}</td>
                  <td>{subject.teacher}</td>
                  <td>{subject.room}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default Timetable;
