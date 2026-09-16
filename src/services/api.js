import axios from 'axios';

const API = axios.create({
    baseURL: (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api',
});

/**
 * AUTH INTERCEPTOR
 * Automatically attaches the JWT token or User ID to every request
 * so you don't have to manually add headers in your components.
 */
API.interceptors.request.use((req) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        req.headers.Authorization = `Bearer ${user.token}`;
    }
    return req;
});

// --- AUTHENTICATION ENDPOINTS ---
export const login = (credentials) => API.post('/auth/login', credentials);
export const signup = (userData) => API.post('/auth/signup', userData);

// --- DASHBOARD & ANALYTICS ---
// Fetches both timetable and attendance in one go for the charts
export const fetchDashboardData = (userId) => API.get(`/dashboard/${userId}`);

// --- ATTENDANCE ENDPOINTS ---
// Gets records for a specific user
export const fetchAttendance = (userId) => API.get(`/attendance/${userId}`);
// Saves a "Present" or "Absent" mark to MySQL
export const markAttendance = (attendanceData) => API.post('/attendance/mark', attendanceData);
// Deletes a specific attendance record
export const deleteAttendance = (recordId) => API.delete(`/attendance/${recordId}`);

// --- TIMETABLE ENDPOINTS ---
// Fetches the user's uploaded timetable
export const fetchTimetable = (userId) => API.get(`/timetable/${userId}`);
// Uploads new timetable JSON/Array to MySQL
export const uploadTimetable = (timetableData) => API.post('/timetable/upload', timetableData);
// Clears the entire timetable for a fresh start
export const clearTimetable = (userId) => API.delete(`/timetable/clear/${userId}`);

export default API;