import { SetterOrUpdater } from "recoil";
import GameDetailInfo from "../../pages/HistoryPage/GameDetailInfo";
import {
  GameDto,
  ICurrentGame,
  IGameRoomInfo,
  IJoinnedChat,
  UserDto,
} from "../interface";

export const listenCreateGame = ({
  socket,
  myInfo,
  setCurrentGame,
  navigate,
  setCurrentChat,
  setJoinnedChatList,
  joinnedChatList,
}: {
  socket: any;
  setCurrentGame: any;
  myInfo: any;
  navigate: any;
  setCurrentChat: any;
  setJoinnedChatList: SetterOrUpdater<IJoinnedChat>;
  joinnedChatList: IJoinnedChat;
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
      opponentDto: null;
      watchersDto: null;
    }) => {
      console.log("on create-game", ownerDto);
      setCurrentGame({
        gameDto: { ...gameDto },
        ownerDto: { ...myInfo },
        opponentDto: null,
        watchersDto: [],
      });
      setCurrentChat(gameDto.title);
      setJoinnedChatList({
        ...joinnedChatList,
        [gameDto.title]: {
          title: gameDto.title,
          type: 0,
          operator: "",
          userList: [ownerDto.userName],
          chatLogs: [],
          banUsers: [],
          newMsg: false,
          isMuted: false,
          muteId: -1,
        },
      });
      navigate("/main/game/normal");
    }
  );
};

export const listenNewGame = ({
  socket,
  gameList,
  setGameList,
}: {
  socket: any;
  gameList: any;
  setGameList: any;
}) => {
  socket.on("new-game", (game: GameDto) => {
    delete game["password"];
    game.cur = 1;
    setGameList([...gameList, { ...game }]);
  });
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
  currentGame,
  setCurrentGame,
  myInfo,
  setCurrentChat,
  joinnedChatList,
  setJoinnedChatList,
  navigate,
}: {
  socket: any;
  setAlertInfo: any;
  currentGame: ICurrentGame;
  setCurrentGame: any;
  myInfo: UserDto;
  setCurrentChat: any;
  joinnedChatList: any;
  setJoinnedChatList: any;
  navigate: any;
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
    }) => {
      setCurrentGame({
        gameDto: { ...gameDto },
        ownerDto: { ...ownerDto },
        watchersDto: [...watchersDto],
        opponentDto: { ...myInfo },
      });
      setCurrentChat(gameDto.title);
      setJoinnedChatList({
        ...joinnedChatList,
        [gameDto.title]: {
          title: gameDto.title,
          type: 0,
          operator: "",
          userList: [ownerDto.userName],
          chatLogs: [],
          banUsers: [],
          newMsg: false,
          isMuted: false,
          muteId: -1,
        },
      });
      navigate("/main/game/normal");
    }
  );
};

export const listenUserJoinGame = ({
  socket,
  currentGame,
  setCurrentGame,
  setCurrentChat,
  joinnedChatList,
  setJoinnedChatList,
}: {
  socket: any;
  currentGame: any;
  setCurrentGame: any;
  setCurrentChat: any;
  joinnedChatList: any;
  setJoinnedChatList: any;
}) => {
  socket.on(
    "user-join-game",
    ({
      message,
      userInfo,
      type,
      roomName,
    }: {
      message: string;
      userInfo: UserDto;
      type: number;
      roomName: string;
    }) => {
      setCurrentGame({
        ...currentGame,
        opponentDto: { ...userInfo },
      });
      setJoinnedChatList({
        ...joinnedChatList,
        [roomName]: {
          title: roomName,
          type: 0,
          operator: "",
          userList: [...joinnedChatList[roomName].userList, userInfo.userName],
          chatLogs: [
            ...joinnedChatList[roomName].chatLogs,
            { sender: "admin", msg: message, time: new Date() },
          ],
          banUsers: [],
          newMsg: false,
          isMuted: false,
          muteId: -1,
        },
      });
    }
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

export const listenLeaveGame = ({
  socket,
  navigate,
  joinnedChatList,
  setJoinnedChatList,
  setCurrentChat,
  currentChat,
  setChatList,
  chatList,
}: {
  socket: any;
  navigate: any;
  joinnedChatList: any;
  setJoinnedChatList: any;
  setCurrentChat: any;
  currentChat: any;
  setChatList: any;
  chatList: any;
}) => {
  socket.on("leave-game", (message: string) => {
    console.log("in leave-game", message);
    const temp = { ...joinnedChatList };
    delete temp[currentChat];
    setChatList(
      chatList.map((chat: GameDto) =>
        chat.title === currentChat
          ? { ...chat, cur: chat.cur - 1 }
          : { ...chat }
      )
    );
    setJoinnedChatList({ ...temp });
    setCurrentChat("");
    navigate("/main/lobby");
  });
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
