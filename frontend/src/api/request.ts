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
  const response = await instance.post(axiosCreateGameURL, {
    title,
    interrupt_mode,
    private_mode,
    password,
  });

  console.log(response);
};
