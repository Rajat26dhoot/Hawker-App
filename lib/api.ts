import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.1.2:5000",  // ✅ Make sure it's wrapped in quotes and includes http://
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
