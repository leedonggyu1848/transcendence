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

const axiosGetMyInfoURL = "/auth/userinfo/";
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
export const axiosUpdateProfileImage = async (formData: FormData) => {
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
export const axiosUpdateIntroduce = async (introduce: string) => {
  const response = await instance.post(axiosUpdateIntroduceURL, { introduce });
  return response.data;
};

const axiosGetFriendsListURL = "/friend/list";
export const axiosGetFriendsList = async () => {
  const response = await instance.get(axiosGetFriendsListURL);

  return response.data;
};

const axiosGetFriendRequestListURL = "/friend/request-list";
export const axiosGetFriendRequestList = async () => {
  const response = await instance.get(axiosGetFriendRequestListURL);

  return response.data;
};

const axiosAcceptFriendRequestURL = "/friend/accept-request";
export const axiosAcceptFriendRequest = async (friendname: string) => {
  await instance.post(axiosAcceptFriendRequestURL, { friendname });
};

const axiosSendFriendRequestURL = "/friend/send-request";
export const axiosSendFriendRequest = async (friendname: string) => {
  await instance.post(axiosSendFriendRequestURL, { friendname });
};

const axiosPostAuthCodeURL = "/auth/two-factor";
export const axiosPostAuthCode = async (code: string) => {
  const response = await instance.post(axiosPostAuthCodeURL, { code });
  return response.data;
};

const axiosChangeNickNameURL = "/auth/user/name";
export const axiosChangeNickName = async (userName: string) => {
  const response = await instance.post(axiosChangeNickNameURL, { userName });
  return response.data;
};

const axiosRequestUserInfoURL = "/auth/userinfo/";
export const axiosRequestUserInfo = async (userName: string) => {
  const response = await instance.get(axiosRequestUserInfoURL + userName);
  return response.data;
};
