import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests automatically
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Auth APIs
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    getProfile: () => api.get('/auth/profile')
};

// Student APIs
export const studentAPI = {
    getAll: () => api.get('/students'),
    getById: (id) => api.get(`/students/${id}`),
    getByClass: (className) => api.get(`/students/class/${className}`)
};

// Marks APIs
export const marksAPI = {
    getStudentMarks: (studentId) => api.get(`/marks/student/${studentId}`),
    getSubjectWisePerformance: (studentId) => api.get(`/marks/student/${studentId}/subject-wise`),
    getClassPerformance: (className) => api.get(`/marks/class/${className}/performance`)
};

// Attendance APIs
export const attendanceAPI = {
    getStudentAttendance: (studentId, params) => api.get(`/attendance/student/${studentId}`, { params }),
    mark: (data) => api.post('/attendance', data)
};

export default api;