import axios from "axios";
import { Cookies } from "react-cookie";

axios.defaults.withCredentials = true;

const instance = axios.create({
  // baseURL: window.location.origin,
  baseURL: import.meta.env.VITE_FRONT_ADDRESS + "/api/",
  withCredentials: true,
});

instance.interceptors.request.use(async (config: any) => {
  const cookies = new Cookies();
  const token = cookies.get("access_token");
  config.headers = {
    Authorization: `Bearer ${token}`,
  };
  return config;
});

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const cookies = new Cookies();
    // access_token unauthorized
    if (error.response?.status === 401) {
      cookies.remove("access_token", {
        path: "/",
        domain: "10.12.6.6",
      });
      window.location.href = "/no_auth";
      //alert(error.response.data.message);
    }
    return Promise.reject(error);
  }
);

export default instance;
