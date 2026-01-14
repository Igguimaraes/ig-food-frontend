import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3333",
});

// Interceptor: sempre que houver token salvo, envia no header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
