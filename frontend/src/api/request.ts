import instance from "./instance";

const axiosLoginURL = "/auth/login";
export const axiosLogin = async () => {
  const response = await instance.get(axiosLoginURL);

  console.log(response);
};

const axiosGetGameListURL = "/game/lobby";
export const axiosGetGameList = async () => {
  const { data } = await instance.get(axiosGetGameListURL);
  console.log(data);
  return data;
};

const axiosCreateGameURL = "/game/new_game";
export const axiosCreateGame = async (
  title: string,
  interrupt_mode: boolean,
  private_mode: boolean,
  password: string
) => {
  try {
    const response = await instance.post(axiosCreateGameURL, {
      title,
      interrupt_mode,
      private_mode,
      password,
    });

    console.log(response.data);

    return response.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const axiosWatchGameURL = "/game/watch";
export const axiosWatchGame = async (title: string, password: string) => {
  const response = await instance.post(axiosWatchGameURL, {
    title,
    password,
  });
  console.log(response.data);
  return response.data;
};

const axiosJoinGameURL = "/game/join";
export const axiosJoinGame = async (title: string, password: string) => {
  const response = await instance.post(axiosJoinGameURL, {
    title,
    password,
  });
  console.log(response);
  return response.data;
};

const axiosPostFlushURL = "/game/flush";
export const axiosPostFlush = async (title: string) => {
  const response = await instance.post(axiosPostFlushURL, {
    title,
  });

  console.log(response);
};

const axiosGetMyInfoURL = "/game/userinfo/";
export const axiosGetMyInfo = async () => {
  const response = await instance.get(axiosGetMyInfoURL);

  console.log(response);
  return response.data;
};

const axiosLeaveNormalGameURL = "/game/leave";
export const axiosLeaveNormalGame = async () => {
  const response = await instance.get(axiosLeaveNormalGameURL);

  console.log(response);
};

const axiosRecordGameResultURL = "/game/result";
export const axiosRecordGameResult = async (
  win: string,
  lose: string,
  type: number
) => {
  // type : normal = 0, rank = 1
  try {
    await instance.post(axiosRecordGameResultURL, { win, lose, type });
    console.log("게임 결과 저장 완료");
  } catch (e) {
    console.error(e);
    alert("게임 결과 저장 실패");
  }
};

const axiosGetHistoryURL = "/game/history/";
export const axiosGetHistory = async (page: number) => {
  try {
    const result = await instance.get(axiosGetHistoryURL + `?page=${page}`);
    console.log(result);
    return result.data.records;
  } catch (e) {
    console.error(e);
  }
};
