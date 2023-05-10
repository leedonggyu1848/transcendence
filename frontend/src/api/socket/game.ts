import { SetterOrUpdater } from "recoil";
import GameDetailInfo from "../../pages/HistoryPage/GameDetailInfo";
import { socket } from "../../pages/WrapMainPage";
import {
  GameDto,
  ICombinedRequestAndInvite,
  ICurrentGame,
  IFriendDto,
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
      setCurrentGame({
        gameDto: { ...gameDto, type: 0 },
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
          owner: "",
          userList: [ownerDto.userName],
          chatLogs: [],
          banUsers: [],
          newMsg: false,
          isMuted: false,
          muteId: -1,
        },
      });
      navigate("/main/game");
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
        gameDto: { ...gameDto, type: 0 },
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
      navigate("/main/game");
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
  gameList,
  setGameList,
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
  gameList: GameDto[];
  setGameList: any;
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
      setCurrentGame({
        gameDto: { ...gameDto, type: 0 },
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
      navigate("/main/game");
    }
  );
};

export const listenUserWatchGame = ({
  socket,
  currentGame,
  setCurrentGame,
  joinnedChatList,
  setJoinnedChatList,
}: {
  socket: any;
  currentGame: ICurrentGame;
  setCurrentGame: any;
  joinnedChatList: IJoinnedChat;
  setJoinnedChatList: any;
}) => {
  socket.on(
    "user-watch-game",
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
      if (!currentGame || currentGame.gameDto.title !== roomName) return;
      setCurrentGame({
        ...currentGame,
        watchersDto: [...currentGame.watchersDto, { ...userInfo }],
      });
      setJoinnedChatList({
        ...joinnedChatList,
        [roomName]: {
          ...joinnedChatList[roomName],
          userList: [...joinnedChatList[roomName].userList, userInfo.userName],
          chatLogs: [
            ...joinnedChatList[roomName].chatLogs,
            { sender: "admin", msg: message, time: new Date() },
          ],
        },
      });
    }
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
  location,
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
  location: Location;
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
    if (
      currentGame.opponentDto &&
      currentGame.opponentDto.userName === myName
    ) {
      setGameList(
        gameList.map((game: GameDto) =>
          game.title === currentChat ? { ...game, cur: 1 } : { ...game }
        )
      );
    }
    setCurrentGame(null);
    setJoinnedChatList({ ...temp });
    setCurrentChat("");
    //if (location.pathname === "/main/game") navigate("/main/lobby");
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
      console.log("user-leave-game", message, userInfo, type, roomName);
      if (type === 1) {
        if (currentGame && currentGame.gameDto.title === roomName) {
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
          setGameList(
            gameList.map((game: GameDto) =>
              game.title === roomName ? { ...game, cur: 1 } : { ...game }
            )
          );
          setJoinnedChatList({
            ...joinnedChatList,
            [roomName]: {
              ...joinnedChatList[roomName],
              userList: joinnedChatList[roomName].userList.filter(
                (name) => name !== userInfo.userName
              ),
              chatLogs: [
                ...joinnedChatList[roomName].chatLogs,
                { sender: "admin", msg: message, time: new Date() },
              ],
            },
          });
        } else if (type === 3) {
          setCurrentGame({
            ...currentGame,
            watchersDto: currentGame.watchersDto.filter(
              (person: UserDto) => person.userName !== userInfo.userName
            ),
          });
          setJoinnedChatList({
            ...joinnedChatList,
            [roomName]: {
              ...joinnedChatList[roomName],
              userList: joinnedChatList[roomName].userList.filter(
                (name) => name !== userInfo.userName
              ),
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

export const listenMatchRank = ({
  socket,
  setAlertInfo,
  currentGame,
  setCurrentGame,
  myInfo,
  setCurrentChat,
  joinnedChatList,
  setJoinnedChatList,
  navigate,
  setRankWaitModal,
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
  setRankWaitModal: any;
}) => {
  socket.on(
    "match-rank",
    ({
      roomName,
      ownerDto,
      opponentDto,
    }: {
      roomName: string;
      ownerDto: UserDto;
      opponentDto: UserDto;
    }) => {
      setRankWaitModal(false);
      setCurrentGame({
        gameDto: {
          title: roomName,
          interruptMode: false,
          privateMode: false,
          cur: 1,
          type: 1,
        },
        ownerDto: { ...ownerDto },
        opponentDto: { ...opponentDto },
        watchersDto: [],
      });
      setCurrentChat(roomName);
      setJoinnedChatList({
        ...joinnedChatList,
        [roomName]: {
          title: roomName,
          type: 0,
          operator: "",
          userList: [ownerDto.userName, opponentDto.userName],
          chatLogs: [],
          banUsers: [],
          newMsg: false,
          isMuted: false,
          muteId: -1,
        },
      });
      navigate("/main/game");
    }
  );
};

export const listenUserInGame = ({
  socket,
  friendList,
  setFriendList,
}: {
  socket: any;
  friendList: IFriendDto[];
  setFriendList: any;
}) => {
  socket.on("user-ingame", ({ userName }: { userName: string }) => {
    setFriendList(
      friendList.map((friend) =>
        friend.userName === userName ? { ...friend, status: 2 } : { ...friend }
      )
    );
  });
};

export const listenUserGameOut = ({
  socket,
  friendList,
  setFriendList,
}: {
  socket: any;
  friendList: IFriendDto[];
  setFriendList: any;
}) => {
  socket.on("user-gameout", ({ userName }: { userName: string }) => {
    setFriendList(
      friendList.map((friend) =>
        friend.userName === userName ? { ...friend, status: 2 } : { ...friend }
      )
    );
  });
};

export const listenDisconnectUser = ({
  socket,
  friendList,
  setFriendList,
}: {
  socket: any;
  friendList: IFriendDto[];
  setFriendList: any;
}) => {
  socket.on(
    "disconnect-user",
    ({ userName, message }: { userName: string; message: string }) => {
      setFriendList(
        friendList.map((friend) =>
          friend.userName === userName
            ? { ...friend, status: 0 }
            : { ...friend }
        )
      );
    }
  );
};

export const listenGameInvite = ({
  socket,
  myName,
  friendRequestList,
  setFriendRequestList,
}: {
  socket: any;
  myName: string;
  friendRequestList: ICombinedRequestAndInvite[];
  setFriendRequestList: any;
}) => {
  socket.on(
    "game-invite",
    ({ roomName, userName }: { roomName: string; userName: string }) => {
      console.log("in game-invite", roomName, userName);
      if (myName === userName) return;
      setFriendRequestList([
        ...friendRequestList,
        { userName, roomName, inviteType: "게임" },
      ]);
    }
  );
};

export const listenGameAccept = ({ socket }: { socket: any }) => {};

export const listenGameReject = ({
  socket,
  friendRequestList,
  setFriendRequestList,
  myName,
  setAlertInfo,
}: {
  socket: any;
  friendRequestList: ICombinedRequestAndInvite[];
  setFriendRequestList: any;
  myName: string;
  setAlertInfo: any;
}) => {
  socket.on(
    "game-reject",
    ({ userName, roomName }: { userName: string; roomName: string }) => {
      if (userName !== myName) {
        console.log(userName, " has reject your game invite");
        setAlertInfo({
          type: "failure",
          header: "",
          msg: `${userName}님이 초대를 거절했습니다`,
          toggle: true,
        });
      } else {
        console.log("in game-reject success", userName, roomName);
        console.log(friendRequestList);
        setFriendRequestList(
          friendRequestList.filter(
            (list) =>
              !(list.inviteType === "게임" && list.roomName === roomName)
          )
        );
      }
    }
  );
};

export const listenLeaveWhilePlaying = ({ socket }: { socket: any }) => {
  socket.on(
    "leave-while-playing",
    ({ roomName, userName }: { roomName: string; userName: string }) => {
      console.log("leave-while-playing", roomName, userName);
    }
  );
};

export const listenRefreshWhilePlaying = ({
  socket,
  setCount,
  setStart,
  setStartCount,
  setAlertInfo,
  currentGame,
  setCurrentGame,
  myInfo,
  setMyInfo,
  navigate,
}: {
  socket: any;
  setCount: any;
  setStart: any;
  setStartCount: any;
  setAlertInfo: any;
  currentGame: ICurrentGame;
  setCurrentGame: any;
  myInfo: UserDto;
  setMyInfo: any;
  navigate: any;
}) => {
  socket.on(
    "refresh-while-playing",
    ({
      roomName,
      userName,
      type,
    }: {
      roomName: string;
      userName: string;
      type: number;
    }) => {
      console.log("refresh-while-playing", roomName, userName);
      setCount(4);
      setStart(false);
      setStartCount(false);
      setAlertInfo({
        type: "success",
        header: "",
        msg: "상대방이 새로고침해서 승리했습니다",
        toggle: true,
      });
      if (type === 1) {
        setMyInfo({
          ...myInfo,
          rankWin: myInfo.rankWin + 1,
        });
        navigate("/main/lobby");
      } else {
        setMyInfo({
          ...myInfo,
          normalWin: myInfo.normalWin + 1,
        });
        setCurrentGame({
          ...currentGame,
          ownerDto: {
            ...currentGame.ownerDto,
            normalWin:
              currentGame.ownerDto.userName === myInfo.userName
                ? currentGame.ownerDto.normalWin + 1
                : currentGame.ownerDto.normalWin,
            normalLose:
              currentGame.ownerDto.userName === myInfo.userName
                ? currentGame.ownerDto.normalLose
                : currentGame.ownerDto.normalLose + 1,
          },
          opponentDto: {
            ...currentGame.opponentDto,
            normalWin:
              currentGame.opponentDto.userName === myInfo.userName
                ? currentGame.opponentDto.normalWin + 1
                : currentGame.opponentDto.normalWin,
            normalLose:
              currentGame.opponentDto.userName === myInfo.userName
                ? currentGame.opponentDto.normalLose
                : currentGame.opponentDto.normalLose + 1,
          },
        });
      }
    }
  );
};
