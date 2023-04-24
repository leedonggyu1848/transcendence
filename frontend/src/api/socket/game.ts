import GameDetailInfo from "../../pages/HistoryPage/GameDetailInfo";
import { GameDto, IGameRoomInfo, UserDto } from "../interface";

export const listenCreateGame = ({
  socket,
  myInfo,
  setCurrentGame,
  navigate,
}: {
  socket: any;
  setCurrentGame: any;
  myInfo: any;
  navigate: any;
}) => {
  socket.on(
    "create-game",
    ({
      gameDto,
      ownerDto,
      opponentDto,
      watchersDto,
    }: {
      gameDto: IGameRoomInfo;
      ownerDto: UserDto;
      opponentDto: UserDto;
      watchersDto: UserDto[];
    }) => {
      console.log("on create-game");
      console.log(navigate);
      navigate("/main/game/normal");
      setCurrentGame({
        gameDto: { ...gameDto },
        ownerDto: { ...myInfo },
        opponentDto: null,
        watchersDto: [],
        chatLogs: [],
      });
    }
  );
};

export const listenNewGame = ({
  socket,
}: {
  socket: any;
  setFriendRequestList: any;
  friendRequestList: any;
}) => {
  socket.on("new-game", (game: GameDto) => {});
};

export const listenGameFail = ({
  socket,
  setAlertInfo,
}: {
  socket: any;
  setAlertInfo: any;
}) => {
  socket.on("game-fail", (message: string) => {
    setAlertInfo({
      type: "failure",
      header: "",
      msg: message,
      toggle: true,
    });
  });
};

export const listenJoinGame = ({
  socket,
  setAlertInfo,
}: {
  socket: any;
  setAlertInfo: any;
}) => {
  socket.on(
    "join-game",
    ({
      gameDto,
      ownerDto,
      opponentDto,
      watchersDto,
    }: {
      gameDto: GameDto;
      ownerDto: UserDto;
      opponentDto: UserDto;
      watchersDto: UserDto[];
    }) => {}
  );
};

export const listenUserJoinGame = ({ socket }: { socket: any }) => {
  socket.on(
    "user-join-game",
    ({
      message,
      userInfo,
      type,
    }: {
      message: string;
      userInfo: UserDto;
      type: number;
    }) => {}
  );
};

export const listenWatchGame = ({ socket }: { socket: any }) => {
  socket.on(
    "watch-game",
    ({
      gameDto,
      ownerDto,
      opponentDto,
      watchersDto,
    }: {
      gameDto: GameDto;
      ownerDto: UserDto;
      opponentDto: UserDto;
      watchersDto: UserDto[];
    }) => {}
  );
};

export const listenUserWatchGame = ({ socket }: { socket: any }) => {
  socket.on(
    "user-watch-game",
    ({
      message,
      userInfo,
      type,
    }: {
      message: string;
      userInfo: UserDto;
      type: number;
    }) => {}
  );
};

export const listenLeaveGame = ({ socket }: { socket: any }) => {
  socket.on("leave-game", (message: string) => {});
};

export const listenUserLeaveGame = ({ socket }: { socket: any }) => {
  socket.on(
    "user-leave-game",
    ({
      message,
      userInfo,
      type,
    }: {
      message: string;
      userInfo: UserDto;
      type: number;
    }) => {}
  );
};
