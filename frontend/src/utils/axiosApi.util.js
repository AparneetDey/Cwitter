import axios from "axios";

const api = axios.create({
  baseURL: "https://api.example.com",
  timeout: 50000,
  withCredentials: true
});

export default api;