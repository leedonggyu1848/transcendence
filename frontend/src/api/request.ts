import { instance } from "./instance";

const axiosLoginURL = "/auth/login";
export const axiosLogin = async () => {
  const response = await instance.get(axiosLoginURL);

  console.log(response);
};
