import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  TextField,
  Alert,
  Tabs,
  Tab,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemText,
  Grid,
  Card,
  CardContent
} from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, Legend,ResponsiveContainer } from "recharts";
import Lottie from "lottie-react";
import welcomeAnimation from "../assets/welcome-animation.json";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [bunkCalculatorData, setBunkCalculatorData] = useState({
    totalClasses: 0,
    attendedClasses: 0,
    desiredPercentage: 75,
    maxBunks: 0,
    error: "",
  });
  const calculateMaxBunks = () => {
    const { totalClasses, attendedClasses, desiredPercentage } = bunkCalculatorData;
  
    if (totalClasses <= 0 || attendedClasses < 0 || desiredPercentage < 0 || desiredPercentage > 100) {
      setBunkCalculatorData((prev) => ({
        ...prev,
        error: "Please enter valid values.",
        maxBunks: 0,
      }));
      return;
    }
  
    const maxBunks = Math.floor(
      (attendedClasses - (desiredPercentage / 100) * totalClasses) / (1 - desiredPercentage / 100)
    );
  
    setBunkCalculatorData((prev) => ({
      ...prev,
      maxBunks: maxBunks > 0 ? maxBunks : 0,
      error: maxBunks <= 0 ? "You cannot bunk any more classes!" : "",
    }));
  };
  const handleBunkCalculatorChange = (e) => {
    const { name, value } = e.target;
    setBunkCalculatorData((prev) => ({
      ...prev,
      [name]: parseFloat(value),
      error: "",
    }));
  };

  // Sample timetable data
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  

  useEffect(() => {
    const checkUpcomingClass = () => {
      const now = new Date();
      const today = now.toLocaleString("en-US", { weekday: "long" });
      const currentTime = now.getHours() * 60 + now.getMinutes();

      const todaySchedule = timetableData.find((day) => day.day === today);
      if (todaySchedule) {
        todaySchedule.subjects.forEach(({ time, subject }) => {
          const [hour, minute, period] = time.match(/(\d+):(\d+) (AM|PM)/).slice(1);
          let classHour = parseInt(hour) % 12 + (period === "PM" ? 12 : 0);
          const classTimeInMinutes = classHour * 60 + parseInt(minute);

          if (classTimeInMinutes - currentTime === 5) {
            alert(`⏰ Reminder: Your next class, ${subject}, starts in 5 minutes!`);
          }
        });
      }
    };

    const interval = setInterval(checkUpcomingClass, 60000);
    return () => clearInterval(interval);
  }, [timetableData]);

  const attendanceData = [
    { subject: "Mathematics", attended: 15, total: 20 },
    { subject: "Physics", attended: 12, total: 18 },
    { subject: "Chemistry", attended: 20, total: 22 },
    { subject: "English", attended: 18, total: 20 },
    { subject: "History", attended: 14, total: 16 },
  ].map((item) => ({
    ...item,
    percentage: ((item.attended / item.total) * 100).toFixed(2), // Calculate percentage
  }));

  // Calculate total attendance statistics
  const totalClasses = attendanceData.reduce((sum, item) => sum + item.total, 0);
  const attendedClasses = attendanceData.reduce((sum, item) => sum + item.attended, 0);
  const attendancePercentage = ((attendedClasses / totalClasses) * 100).toFixed(2);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

  return (
    <Container>
      <Tabs value={activeTab} onChange={(event, newValue) => setActiveTab(newValue)} centered>
        <Tab label="Home" />
        <Tab label="Attendance" />
        <Tab label="Bunk Calculator" />
        <Tab label="Timetable" />
        <Tab label="Upcoming Classes" />
      </Tabs>
      {activeTab === 0 && (
  <Box
    style={{
      marginTop: "20px",
      padding: "40px",
      backgroundColor: "#f9f9f9",
      borderRadius: "15px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}
  >
    {/* Lottie Animation on the Left */}
    <Box style={{ flex: 1, marginRight: "40px" }}>
      <Lottie
        animationData={welcomeAnimation}
        loop
        autoplay
        replay
        style={{ width: "150%", height: "auto", maxWidth: "550px" }}
      />
    </Box>

    {/* Content on the Right */}
    <Box style={{ flex: 1, textAlign: "left" }}>
      <Typography variant="h3" style={{ fontWeight: "bold", marginBottom: "20px", color: "#333" }}>
        Welcome to BunkMaster! 🎓
      </Typography>
      <Typography variant="h6" style={{ marginBottom: "30px", color: "#555" }}>
        Your all-in-one solution for managing classes, tracking attendance, and staying organized.
      </Typography>

      {/* Feature Highlights */}
      <Box>
        <Typography variant="h6" style={{ fontWeight: "bold", marginBottom: "10px", color: "#333" }}>
          Why Choose BunkMaster?
        </Typography>
        <List>
          <ListItem style={{ padding: "8px 0" }}>
            <Typography variant="body1" style={{ color: "#555" }}>
              📅 Manage your timetable effortlessly.
            </Typography>
          </ListItem>
          <ListItem style={{ padding: "8px 0" }}>
            <Typography variant="body1" style={{ color: "#555" }}>
              📊 Track attendance with detailed insights.
            </Typography>
          </ListItem>
          <ListItem style={{ padding: "8px 0" }}>
            <Typography variant="body1" style={{ color: "#555" }}>
              ⏰ Get reminders for upcoming classes.
            </Typography>
          </ListItem>
        </List>
      </Box>
    </Box>
  </Box>
)}

{activeTab === 1 && (
        <Paper style={{ padding: "20px", marginTop: "20px" }}>
          <Typography variant="h5" gutterBottom>
            Attendance Overview 📊
          </Typography>
          <Grid container spacing={3}>
            {/* Pie Chart */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Attendance Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height={400}> {/* Increased height */}
                    <PieChart>
                      <Pie
                        data={attendanceData}
                        dataKey="attended"
                        nameKey="subject"
                        cx="50%"
                        cy="50%"
                        outerRadius={150}
                        fill="#8884d8"
                        label
                      >
                        {attendanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend
                        layout="vertical"
                        align="right"
                        verticalAlign="middle"
                        wrapperStyle={{ paddingLeft: "20px" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Attendance Summary */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Attendance Summary
                  </Typography>
                  <Typography variant="body1" style={{ marginBottom: "10px" }}>
                    Total Classes: <strong>{totalClasses}</strong>
                  </Typography>
                  <Typography variant="body1" style={{ marginBottom: "10px" }}>
                    Attended Classes: <strong>{attendedClasses}</strong>
                  </Typography>
                  <Typography variant="body1" style={{ marginBottom: "10px" }}>
                    Overall Attendance: <strong>{attendancePercentage}%</strong>
                  </Typography>
                  <Typography variant="h6" gutterBottom style={{ marginTop: "20px" }}>
                    Subject-wise Attendance
                  </Typography>
                  {attendanceData.map((item, index) => (
                    <Typography key={index} variant="body1" style={{ marginBottom: "10px" }}>
                      {item.subject}: <strong>{item.percentage}%</strong> ({item.attended}/{item.total})
                    </Typography>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      )}

{activeTab === 2 && (
  <Paper style={{ padding: "20px", marginTop: "20px" }}>
    <Typography variant="h5" gutterBottom>
      Bunk Calculator 🧮
    </Typography>
    <Typography variant="body1" style={{ marginBottom: "20px" }}>
      Calculate the maximum number of classes you can bunk without falling below your desired attendance percentage.
    </Typography>

    {/* Manual Bunk Calculator */}
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Total Classes"
          type="number"
          name="totalClasses"
          value={bunkCalculatorData.totalClasses}
          onChange={handleBunkCalculatorChange}
          variant="outlined"
          style={{ marginBottom: "20px" }}
        />
        <TextField
          fullWidth
          label="Attended Classes"
          type="number"
          name="attendedClasses"
          value={bunkCalculatorData.attendedClasses}
          onChange={handleBunkCalculatorChange}
          variant="outlined"
          style={{ marginBottom: "20px" }}
        />
        <TextField
          fullWidth
          label="Desired Attendance Percentage (%)"
          type="number"
          name="desiredPercentage"
          value={bunkCalculatorData.desiredPercentage}
          onChange={handleBunkCalculatorChange}
          variant="outlined"
          style={{ marginBottom: "20px" }}
        />
        <Button variant="contained" color="primary" onClick={calculateMaxBunks}>
          Calculate
        </Button>
      </Grid>
      <Grid item xs={12} md={6}>
        {bunkCalculatorData.error && (
          <Alert severity="error" style={{ marginBottom: "20px" }}>
            {bunkCalculatorData.error}
          </Alert>
        )}
        <Typography variant="h6" style={{ marginBottom: "10px" }}>
          Result:
        </Typography>
        <Typography variant="body1">
          Maximum classes you can bunk: <strong>{bunkCalculatorData.maxBunks}</strong>
        </Typography>
      </Grid>
    </Grid>

    {/* Subject-wise Bunk Analysis */}
    <Typography variant="h6" style={{ marginTop: "40px", marginBottom: "20px" }}>
      Subject-wise Bunk Analysis
    </Typography>
    <Grid container spacing={3}>
      {attendanceData.map((subject, index) => {
        const { subject: subjectName, attended, total } = subject;
        const percentage = ((attended / total) * 100).toFixed(2);
        const isSafeToBunk = percentage >= 75; // Green if >= 75%, else Red

        return (
          <Grid item xs={12} md={6} key={index}>
            <Card
              style={{
                backgroundColor: isSafeToBunk ? "#e8f5e9" : "#ffebee", // Green or Red background
                border: `1px solid ${isSafeToBunk ? "#4caf50" : "#f44336"}`, // Green or Red border
              }}
            >
              <CardContent>
                <Typography variant="h6" style={{ marginBottom: "10px" }}>
                  {subjectName}
                </Typography>
                <Typography variant="body1">
                  Attended: <strong>{attended}</strong> / <strong>{total}</strong>
                </Typography>
                <Typography variant="body1">
                  Attendance: <strong>{percentage}%</strong>
                </Typography>
                <Typography
                  variant="body1"
                  style={{ color: isSafeToBunk ? "#4caf50" : "#f44336", fontWeight: "bold" }}
                >
                  {isSafeToBunk ? "Safe to Bunk 🟢" : "Danger Zone 🔴"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  </Paper>
)}
      

      {activeTab === 3 && (
        <Paper style={{ padding: "20px", marginTop: "20px" }}>
          <Typography variant="h5">Weekly Timetable 📅</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell style={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Day</TableCell>
                  <TableCell style={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Time</TableCell>
                  <TableCell style={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Subject</TableCell>
                  <TableCell style={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Teacher</TableCell>
                  <TableCell style={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Room</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {timetableData.map((day, index) => (
                  day.subjects.map((subject, subIndex) => (
                    <TableRow key={`${index}-${subIndex}`} style={{ backgroundColor: subIndex % 2 === 0 ? "#ffffff" : "#f9f9f9" }}>
                      {subIndex === 0 && (
                        <TableCell rowSpan={day.subjects.length} style={{ fontWeight: "bold" }}>{day.day}</TableCell>
                      )}
                      <TableCell>{subject.time}</TableCell>
                      <TableCell>{subject.subject}</TableCell>
                      <TableCell>{subject.teacher}</TableCell>
                      <TableCell>{subject.room}</TableCell>
                    </TableRow>
                  ))
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

{activeTab === 4 && (
  <Paper style={{ padding: "20px", marginTop: "20px" }}>
    <Typography variant="h5" gutterBottom>
      Today's Upcoming Classes ⏳
    </Typography>
    {(() => {
      const now = new Date();
      const today = now.toLocaleString("en-US", { weekday: "long" });
      const currentTime = now.getHours() * 60 + now.getMinutes(); // Convert current time to minutes

      const todaySchedule = timetableData.find((day) => day.day === today);

      if (!todaySchedule) {
        return (
          <Typography variant="body1" style={{ color: "#555" }}>
            No classes scheduled for today. Enjoy your day! 🎉
          </Typography>
        );
      }

      const upcomingClasses = todaySchedule.subjects.filter(({ time }) => {
        const [hour, minute, period] = time.match(/(\d+):(\d+) (AM|PM)/).slice(1);
        let classHour = parseInt(hour) % 12 + (period === "PM" ? 12 : 0);
        const classTimeInMinutes = classHour * 60 + parseInt(minute);
        return classTimeInMinutes >= currentTime; // Filter classes that are yet to start
      });

      if (upcomingClasses.length === 0) {
        return (
          <Typography variant="body1" style={{ color: "#555" }}>
            No more classes for today. You're done for the day! 🎉
          </Typography>
        );
      }

      return (
        <List>
          {upcomingClasses.map(({ time, subject, teacher, room }, index) => (
            <ListItem key={index} style={{ padding: "10px 0" }}>
              <ListItemText
                primary={`${time} - ${subject}`}
                secondary={`Teacher: ${teacher} | Room: ${room}`}
                style={{ color: "#333" }}
              />
            </ListItem>
          ))}
        </List>
      );
    })()}
  </Paper>
)}
    </Container>
  );
};

export default Dashboard;