import axios from "axios";
import { Cookies } from "react-cookie";

axios.defaults.withCredentials = true;

const instance = axios.create({
  // baseURL: window.location.origin,
  baseURL: "http://localhost:3000/api/",
  withCredentials: true,
});

instance.interceptors.request.use(async (config: any) => {
  const cookies = new Cookies();
  const token = cookies.get("access_token");
  console.log(token);
  config.headers = {
    Authorization: `Bearer ${token}`,
  };
  console.log(config);
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
        domain: "localhost",
      });
      //window.location.href = "/";
      //alert(error.response.data.message);
    }
    return Promise.reject(error);
  }
);

export default instance;
