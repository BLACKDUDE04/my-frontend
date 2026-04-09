import axios from "axios";

// Create API instance
const api = axios.create({
  baseURL: "https://my-backend-1-c9a1.onrender.com", // your backend URL
});


// Add token automatically to headers
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // Bearer prefix
  }
  return config;
});

// Handle invalid token globally
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token invalid or expired
      localStorage.clear(); // clear localStorage
      window.location.href = "/login"; // redirect to login page
    }
    return Promise.reject(error);
  }
);

export default api;
