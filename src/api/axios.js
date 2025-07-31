// src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL:"https://fin-track-be.vercel.app/api/",
});

export default api;
