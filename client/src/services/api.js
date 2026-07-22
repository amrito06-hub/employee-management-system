import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5001/api",
});

// =========================
// AUTO ATTACH TOKEN TO EVERY REQUEST
// =========================
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// =========================
// HANDLE INVALID / EXPIRED TOKEN
// =========================
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || "";

    const isAuthRequest =
      requestUrl.includes("/admin/login") ||
      requestUrl.includes("/admin/register");

    if (status === 401 && !isAuthRequest) {
      localStorage.removeItem("token");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default API;