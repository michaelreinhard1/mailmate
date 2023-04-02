import axios from "axios";

const api = axios.create({ baseURL: `${import.meta.env.VITE_API_URL}/api/` });

api.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["x-access-token"] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.log(error);
    if (error.response.status === 401) {
      localStorage.clear();
      // window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export { api };
