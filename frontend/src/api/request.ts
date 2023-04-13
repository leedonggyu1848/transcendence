import axios from "axios";
import instance from "./instance";
import { UserDto } from "./interface";

const axiosLoginURL = "/auth/login";
export const axiosLogin = async () => {
  await instance.get(axiosLoginURL);
};

const axiosGetGameListURL = "/game/lobby";
export const axiosGetGameList = async () => {
  const { data } = await instance.get(axiosGetGameListURL);
  return data;
};

const axiosCreateGameURL = "/game/new_game";
export const axiosCreateGame = async (
  title: string,
  interrupt_mode: boolean,
  private_mode: boolean,
  password: string
) => {
  const response = await instance.post(axiosCreateGameURL, {
    title,
    interrupt_mode,
    private_mode,
    password,
  });

  return response.data;
};

const axiosWatchGameURL = "/game/watch";
export const axiosWatchGame = async (title: string, password: string) => {
  const response = await instance.post(axiosWatchGameURL, {
    title,
    password,
  });
  return response.data;
};

const axiosJoinGameURL = "/game/join";
export const axiosJoinGame = async (title: string, password: string) => {
  const response = await instance.post(axiosJoinGameURL, {
    title,
    password,
  });
  return response.data;
};

const axiosPostFlushURL = "/game/flush";
export const axiosPostFlush = async (title: string) => {
  await instance.post(axiosPostFlushURL, {
    title,
  });
};

const axiosGetMyInfoURL = "/game/userinfo/";
export const axiosGetMyInfo = async (): Promise<UserDto> => {
  const response = await instance.get(axiosGetMyInfoURL);
  return response.data;
};

const axiosLeaveNormalGameURL = "/game/leave";
export const axiosLeaveNormalGame = async () => {
  await instance.get(axiosLeaveNormalGameURL);
};

const axiosRecordGameResultURL = "/game/result";
export const axiosRecordGameResult = async (
  win: string,
  lose: string,
  type: number
) => {
  // type : normal = 0, rank = 1
  await instance.post(axiosRecordGameResultURL, { win, lose, type });
};

const axiosGetHistoryURL = "/game/history/";
export const axiosGetHistory = async (page: number) => {
  const result = await instance.get(axiosGetHistoryURL + `?page=${page}`);
  return result.data.records;
};

const axiosGetUserGameRecordURL = "/game/history/";
export const axiosGetUserGameRecord = async (gameId: number) => {
  const result = await instance.get(axiosGetUserGameRecordURL + gameId);
  return result.data;
};

const axiosUpdateProfileImageURL = "/auth/user/profile/";
export const axiosUpdateProfileImage = async (
  name: string,
  formData: FormData
) => {
  const config = {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  };
  const response = await instance.post(
    axiosUpdateProfileImageURL,
    formData,
    config
  );

  return response.data;
};

const axiosUpdateIntroduceURL = "/auth/user/introduce";
export const axiosUpdateIntroduce = async (name: string, msg: string) => {
  const response = await instance.post(axiosUpdateIntroduceURL, {
    intra_id: name,
    introduce: msg,
  });
  return response.data;
};
