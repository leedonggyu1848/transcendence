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
      gameDto: GameDto;
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
    console.log("in new-game", game);
    delete game["password"];
    game["cur"] = 1;
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
  gameList,
  setGameList,
}: {
  socket: any;
  currentGame: ICurrentGame;
  setCurrentGame: any;
  setCurrentChat: any;
  joinnedChatList: any;
  setJoinnedChatList: any;
  gameList: GameDto[];
  setGameList: any;
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
      console.log("in user-join-game", gameList);
      if (currentGame && currentGame.gameDto.title === roomName) {
        setCurrentGame({
          ...currentGame,
          opponentDto: { ...userInfo },
        });
        setJoinnedChatList({
          ...joinnedChatList,
          [roomName]: {
            title: roomName,
            type: 1,
            operator: "",
            userList: [
              ...joinnedChatList[roomName].userList,
              userInfo.userName,
            ],
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
      console.log("in user-join-game", gameList);
      setGameList(
        gameList.map((game: GameDto) =>
          game.title === roomName ? { ...game, cur: game.cur + 1 } : { ...game }
        )
      );
    }
  );
};

export const listenWatchGame = ({
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
    }) => {
      console.log("in watch-game");
      console.log(gameDto, ownerDto, opponentDto, watchersDto);
      setCurrentGame({
        gameDto,
        ownerDto,
        opponentDto,
        watchersDto,
      });
      setCurrentChat(gameDto.title);
      let tempChatList = [];
      tempChatList.push(ownerDto.userName);
      if (opponentDto) tempChatList.push(opponentDto.userName);
      if (watchersDto) tempChatList = [...tempChatList, ...watchersDto];
      setJoinnedChatList({
        ...joinnedChatList,
        [gameDto.title]: {
          title: gameDto.title,
          type: 1,
          operator: "",
          userList: [...tempChatList],
          chatLogs: [],
          banUsers: [],
          newMsg: false,
          isMuted: false,
          muteId: -1,
        },
      });
    }
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
  setGameList,
  gameList,
  currentGame,
  myName,
  setCurrentGame,
}: {
  socket: any;
  navigate: any;
  joinnedChatList: any;
  setJoinnedChatList: any;
  setCurrentChat: any;
  currentChat: any;
  setGameList: any;
  gameList: any;
  currentGame: ICurrentGame;
  setCurrentGame: any;
  myName: any;
}) => {
  socket.on("leave-game", (message: string) => {
    console.log("in leave-game", message);
    const temp = { ...joinnedChatList };
    delete temp[currentChat];
    //if (currentGame.ownerDto.userName === myName) {
    //  setGameList(
    //    gameList.filter((game: GameDto) => game.title !== currentChat)
    //  );
    //} else {
    //  setGameList(
    //    gameList.map((game: GameDto) =>
    //      game.title === currentChat
    //        ? { ...game, cur: game.cur - 1 }
    //        : { ...game }
    //    )
    //  );
    //}
    setCurrentGame(null);
    setJoinnedChatList({ ...temp });
    setCurrentChat("");
    navigate("/main/lobby");
  });
};

export const listenUserLeaveGame = ({
  socket,
  navigate,
  joinnedChatList,
  setJoinnedChatList,
  setCurrentChat,
  currentChat,
  setGameList,
  gameList,
  setAlertInfo,
  currentGame,
  setCurrentGame,
}: {
  socket: any;
  navigate: any;
  joinnedChatList: any;
  setJoinnedChatList: any;
  setCurrentChat: any;
  currentChat: any;
  setGameList: any;
  gameList: any;
  setAlertInfo: any;
  currentGame: ICurrentGame;
  setCurrentGame: any;
}) => {
  socket.on(
    "user-leave-game",
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
      console.log("in user-leave-game", type);
      if (type === 1) {
        if (
          currentGame &&
          currentGame.ownerDto.userName === userInfo.userName
        ) {
          const temp = { ...joinnedChatList };
          delete temp[currentChat];
          setJoinnedChatList({ ...temp });
          setCurrentChat("");
          navigate("/main/lobby");
          setCurrentGame(null);
          setAlertInfo({
            type: "failure",
            header: "",
            msg: message,
            toggle: true,
          });
        }
        setGameList(
          gameList.filter((game: GameDto) => game.title !== roomName)
        );
      } else {
        if (!currentGame || currentGame.gameDto.title !== roomName) {
          setGameList(
            gameList.map((game: GameDto) =>
              game.title === roomName
                ? { ...game, cur: game.cur - 1 }
                : { ...game }
            )
          );
          return;
        }
        if (type === 2) {
          setCurrentGame({
            ...currentGame,
            opponentDto: null,
          });
          setJoinnedChatList({
            ...joinnedChatList,
            [roomName]: {
              ...joinnedChatList[roomName],
              chatLogs: [
                ...joinnedChatList[roomName].chatLogs,
                { sender: "admin", msg: message, time: new Date() },
              ],
            },
          });
        }
      }
    }
  );
};