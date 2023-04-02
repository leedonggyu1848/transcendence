import axios from "axios";

export const instance = axios.create({
  // baseURL: window.location.origin,
  baseURL: "http://localhost:3000/api/",
  withCredentials: true,
});
