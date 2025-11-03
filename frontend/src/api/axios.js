import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000", // backend base URL
  withCredentials: true, // included auth cookies if needed
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
