import {
  IChatDetail,
  IChatRoom,
  IFriendDto,
  IFriendRequest,
  IJoinnedChat,
} from "../interface";

export const listenFirstConnection = ({ socket }: { socket: any }) => {
  socket.on("first-connection", () => {
    socket.emit("friend-request-list");
    socket.emit("friend-list");
    socket.emit("all-chat");
  });
};

export const listenFriendConnection = ({
  socket,
  setFriendList,
  friendList,
}: {
  socket: any;
  setFriendList: any;
  friendList: any;
}) => {
  socket.on(
    "connect-user",
    ({ userName, message }: { userName: string; message: string }) => {
      setFriendList(
        friendList.map((friend: IFriendDto) =>
          friend.userName === userName
            ? { ...friend, status: 1 }
            : { ...friend }
        )
      );
    }
  );
};

export const listenFriendRequestList = ({
  socket,
  setFriendRequestList,
}: {
  socket: any;
  setFriendRequestList: any;
}) => {
  socket.on("friend-request-list", (request: IFriendRequest[]) => {
    setFriendRequestList([...request]);
  });
};

export const listenFriendList = ({
  socket,
  setFriendList,
  setRequestFriendListFlag,
}: {
  socket: any;
  setFriendList: any;
  setRequestFriendListFlag: any;
}) => {
  socket.on("friend-list", (friends: IFriendDto[]) => {
    setFriendList([...friends]);
    setRequestFriendListFlag(true);
  });
};

export const listenCancelFriend = ({
  socket,
  setFriendRequestList,
  friendRequestList,
}: {
  socket: any;
  setFriendRequestList: any;
  friendRequestList: any;
}) => {
  socket.on("cancel-friend", (userName: string) => {
    setFriendRequestList(
      friendRequestList.filter(
        (friend: IFriendRequest) => friend.userName !== userName
      )
    );
  });
};

export const listenRequestFriend = ({
  socket,
  friendRequestList,
  setFriendRequestList,
}: {
  socket: any;
  friendRequestList: any;
  setFriendRequestList: any;
}) => {
  socket.on(
    "request-friend",
    ({ userName, profile }: { userName: string; profile: string }) => {
      setFriendRequestList([
        ...friendRequestList,
        {
          userName: userName,
          profile: profile,
          time: new Date().toString(),
          type: 0,
        },
      ]);
    }
  );
};

export const listenNewFriend = ({
  socket,
  setFriendList,
  friendList,
  setFriendRequestList,
  friendRequestList,
}: {
  socket: any;
  setFriendList: any;
  friendList: any;
  setFriendRequestList: any;
  friendRequestList: any;
}) => {
  socket.on(
    "new-friend",
    ({ userName, profile }: { userName: string; profile: string }) => {
      setFriendRequestList([
        ...friendRequestList,
        {
          userName: userName,
          profile: profile,
          time: new Date().toString(),
          type: 1,
        },
      ]);
    }
  );
};

export const listenDeleteFriend = ({
  socket,
  setFriendList,
  friendList,
}: {
  socket: any;
  setFriendList: any;
  friendList: any;
}) => {
  socket.on("delete-friend", ({ userName }: { userName: string }) => {
    setFriendList(
      friendList.filter((friend: IFriendDto) => friend.userName !== userName)
    );
  });
};

export const listenFriendResult = ({
  socket,
  setFriendRequestList,
  setFriendList,
  friendRequestList,
  friendList,
}: {
  socket: any;
  setFriendRequestList: any;
  setFriendList: any;
  friendRequestList: any;
  friendList: any;
}) => {
  socket.on(
    "friend-result",
    ({
      userName,
      type,
      profile,
    }: {
      userName: string;
      type: boolean;
      profile: string;
    }) => {
      setFriendRequestList(
        friendRequestList.filter(
          (request: IFriendRequest) => request.userName !== userName
        )
      );
      if (type) {
        socket.emit("check-connection", userName);
        setFriendList([
          ...friendList,
          { userName: userName, profile: profile },
        ]);
      }
    }
  );
};

export const listenResponseFriend = ({
  socket,
  setFriendRequestList,
  setFriendList,
  friendRequestList,
  friendList,
}: {
  socket: any;
  setFriendRequestList: any;
  setFriendList: any;
  friendRequestList: any;
  friendList: any;
}) => {
  socket.on(
    "response-friend",
    ({
      userName,
      type,
      profile,
    }: {
      userName: string;
      type: boolean;
      profile: string;
    }) => {
      setFriendRequestList(
        friendRequestList.filter(
          (request: IFriendRequest) => request.userName !== userName
        )
      );
      if (type) {
        setFriendList([
          ...friendList,
          { userName: userName, profile: profile, status: 1 },
        ]);
      }
    }
  );
};

export const listenCheckConnection = ({
  socket,
  friendList,
  setFriendList,
}: {
  socket: any;
  setAlertInfo: any;
  friendList: any;
  setFriendList: any;
}) => {
  socket.on(
    "check-connection",
    ({ userName, isConnect }: { userName: string; isConnect: boolean }) => {
      console.log("isConnect", userName, isConnect);
      if (isConnect) {
        setFriendList(
          friendList.map((friend: IFriendDto) =>
            friend.userName === userName
              ? { ...friend, status: 1 }
              : { ...friend }
          )
        );
      } else {
        setFriendList(
          friendList.map((friend: IFriendDto) =>
            friend.userName === userName
              ? { ...friend, status: "offline" }
              : { ...friend }
          )
        );
      }
    }
  );
};

export const listenFriendFail = ({
  socket,
  setAlertInfo,
}: {
  socket: any;
  setAlertInfo: any;
}) => {
  socket.on("friend-fail", (message: string) => {
    setAlertInfo({
      type: "failure",
      header: "",
      msg: message,
      toggle: true,
    });
  });
};

export const listenMessage = ({
  socket,
  joinnedChatList,
  setJoinnedChatList,
  currentChat,
}: {
  currentChat: any;
  socket: any;
  joinnedChatList: any;
  setJoinnedChatList: any;
}) => {
  socket.on(
    "message",
    ({
      roomName,
      userName,
      message,
    }: {
      roomName: string;
      userName: string;
      message: string;
    }) => {
      setJoinnedChatList({
        ...joinnedChatList,
        [roomName]: {
          ...joinnedChatList[roomName],
          chatLogs: [
            ...joinnedChatList[roomName].chatLogs,
            {
              sender: userName,
              msg: message,
              time: new Date(),
            },
          ],
          newMsg: roomName === currentChat ? false : true,
        },
      });
    }
  );
};

export const listenCreateChat = ({
  socket,
  myName,
  setCurrentChat,
  chatList,
  setChatList,
  joinnedChatList,
  setJoinnedChatList,
}: {
  socket: any;
  myName: any;
  setCurrentChat: any;
  chatList: any;
  setChatList: any;
  joinnedChatList: any;
  setJoinnedChatList: any;
}) => {
  socket.on(
    "create-chat",
    ({
      roomName,
      type,
      operator,
    }: {
      roomName: string;
      type: number;
      operator: string;
    }) => {
      const temp: IChatRoom = {
        title: roomName,
        type,
        operator,
        count: 1,
      };
      setChatList([...chatList, temp]);
      const detailTemp: IChatDetail = {
        title: roomName,
        type,
        operator,
        userList: [myName],
        chatLogs: [],
        banUsers: [],
        newMsg: false,
      };
      if (operator === myName) {
        setCurrentChat(roomName);
        setJoinnedChatList({
          ...joinnedChatList,
          [roomName]: { ...detailTemp },
        });
      }
    }
  );
};

export const listenRequestAllChat = ({
  socket,
  setChatList,
}: {
  socket: any;
  setChatList: any;
}) => {
  socket.on("all-chat", ({ chats }: { chats: IChatRoom[] }) => {
    setChatList([...chats]);
  });
};

export const listenSomeoneJoinned = ({
  socket,
  myName,
  currentChat,
  chatList,
  setChatList,
  joinnedChatList,
  setJoinnedChatList,
}: {
  socket: any;
  myName: string;
  currentChat: string;
  chatList: IChatRoom[];
  setChatList: any;
  joinnedChatList: IJoinnedChat;
  setJoinnedChatList: any;
}) => {
  socket.on(
    "join-chat",
    ({
      message,
      userName,
      roomName,
    }: {
      message: string;
      userName: string;
      roomName: string;
    }) => {
      setChatList(
        chatList.map((chat: IChatRoom) => ({
          ...chat,
          count: chat.title === roomName ? chat.count + 1 : chat.count,
        }))
      );
      if (joinnedChatList[roomName] !== undefined) {
        setJoinnedChatList({
          ...joinnedChatList,
          [roomName]: {
            ...joinnedChatList[roomName],
            userList: [...joinnedChatList[roomName].userList, userName],
            chatLogs:
              currentChat === roomName
                ? [
                    ...joinnedChatList[roomName].chatLogs,
                    {
                      sender: "admin",
                      msg: message,
                      time: new Date(),
                    },
                  ]
                : [...joinnedChatList[roomName].chatLogs],
          },
        });
      }
    }
  );
};

export const listenJoinSucces = ({
  myName,
  socket,
  setCurrentChat,
  chatList,
  setChatList,
  joinnedChatList,
  setJoinnedChatList,
}: {
  myName: string;
  socket: any;
  setCurrentChat: any;
  chatList: IChatRoom[];
  setChatList: any;
  joinnedChatList: IJoinnedChat;
  setJoinnedChatList: any;
}) => {
  socket.on(
    "join-chat-success",
    ({
      roomName,
      type,
      operator,
      users,
    }: {
      roomName: string;
      type: number;
      operator: string;
      users: string[];
    }) => {
      const temp: IChatDetail = {
        title: roomName,
        type,
        operator,
        userList: [...users, myName],
        chatLogs: [],
        banUsers: [],
        newMsg: false,
      };
      setJoinnedChatList({ ...joinnedChatList, [roomName]: temp });
      setCurrentChat(roomName);
      setChatList(
        chatList.map((chat) => ({
          ...chat,
          count: chat.title === roomName ? chat.count + 1 : chat.count,
        }))
      );
    }
  );
};

export const listenSomeoneLeave = ({
  socket,
  chatList,
  setChatList,
  joinnedChatList,
  setJoinnedChatList,
}: {
  socket: any;
  chatList: IChatRoom[];
  setChatList: any;
  joinnedChatList: IJoinnedChat;
  setJoinnedChatList: any;
}) => {
  socket.on(
    "leave-chat",
    ({
      message,
      userName,
      roomName,
    }: {
      message: string;
      userName: string;
      roomName: string;
    }) => {
      setChatList(
        chatList
          .map((chat) => ({
            ...chat,
            count: chat.title === roomName ? chat.count - 1 : chat.count,
          }))
          .filter((chat) => chat.count !== 0)
      );
      if (joinnedChatList[roomName]) {
        setJoinnedChatList({
          ...joinnedChatList,
          [roomName]: {
            ...joinnedChatList[roomName],
            userList: joinnedChatList[roomName].userList.filter(
              (name) => name != userName
            ),
            chatLogs: [
              ...joinnedChatList[roomName].chatLogs,
              {
                sender: "admin",
                msg: message,
                time: new Date(),
              },
            ],
          },
        });
      }
    }
  );
};

export const listenLeaveSuccess = ({
  socket,
  currentChat,
  setCurrentChat,
  chatList,
  setChatList,
  joinnedChatList,
  setJoinnedChatList,
}: {
  socket: any;
  currentChat: string;
  setCurrentChat: any;
  chatList: IChatRoom[];
  setChatList: any;
  joinnedChatList: IJoinnedChat;
  setJoinnedChatList: any;
}) => {
  socket.on("leave-chat-success", (roomName: string) => {
    setChatList(
      chatList
        .map((chat) => ({
          ...chat,
          count: chat.title === roomName ? chat.count - 1 : chat.count,
        }))
        .filter((chat) => chat.count !== 0)
    );
    const temp = { ...joinnedChatList };
    if (currentChat === roomName) {
      setCurrentChat("");
    }
    if (temp[roomName]) delete temp[roomName];
    setJoinnedChatList({ ...temp });
  });
};

export const listenAlert = ({
  socket,
  setAlertInfo,
}: {
  socket: any;
  setAlertInfo: any;
}) => {
  socket.on("chat-fail", (message: string) => {
    setAlertInfo({
      type: "failure",
      header: "",
      msg: message,
      toggle: true,
    });
  });
};

export const listenKickUser = ({
  socket,
  myName,
  currentChat,
  setCurrentChat,
  chatList,
  setChatList,
  joinnedChatList,
  setJoinnedChatList,
}: {
  socket: any;
  myName: string;
  currentChat: string;
  setCurrentChat: any;
  chatList: IChatRoom[];
  setChatList: any;
  joinnedChatList: IJoinnedChat;
  setJoinnedChatList: any;
}) => {
  socket.on(
    "kick-user",
    ({ userName, roomName }: { userName: string; roomName: string }) => {
      if (userName === myName) {
        if (currentChat === roomName) {
          setCurrentChat("");
        }
        const temp: IJoinnedChat = {
          ...joinnedChatList,
        };
        delete temp[roomName];

        setJoinnedChatList({ ...temp });
      }
      if (userName !== myName) {
        setJoinnedChatList({
          ...joinnedChatList,
          [roomName]: {
            ...joinnedChatList[roomName],
            userList: joinnedChatList[roomName].userList.filter(
              (name) => name !== userName
            ),
            chatLogs: [
              ...joinnedChatList[roomName].chatLogs,
              {
                sender: "admin",
                msg: `${userName}님이 추방 되었습니다.`,
                time: new Date(),
              },
            ],
          },
        });
      }
      setChatList(
        chatList.map((chat) => ({
          ...chat,
          count: chat.title === roomName ? chat.count - 1 : chat.count,
        }))
      );
    }
  );
};

export const listenBanUser = ({
  socket,
  myName,
  currentChat,
  setCurrentChat,
  chatList,
  setChatList,
  joinnedChatList,
  setJoinnedChatList,
}: {
  socket: any;
  myName: string;
  currentChat: string;
  setCurrentChat: any;
  chatList: IChatRoom[];
  setChatList: any;
  joinnedChatList: IJoinnedChat;
  setJoinnedChatList: any;
}) => {
  socket.on(
    "ban-user",
    ({ userName, roomName }: { userName: string; roomName: string }) => {
      if (userName === myName) {
        if (currentChat === roomName) {
          setCurrentChat("");
        }
        const temp: IJoinnedChat = {
          ...joinnedChatList,
        };
        delete temp[roomName];
        setJoinnedChatList({ ...temp });
      }
      if (userName !== myName) {
        if (currentChat === roomName) {
          setJoinnedChatList({
            ...joinnedChatList,
            [roomName]: {
              ...joinnedChatList[roomName],
              userList: joinnedChatList[roomName].userList.filter(
                (name) => name !== userName
              ),
              banUsers: joinnedChatList[roomName].banUsers.filter(
                (name) => name !== userName
              ),
              chatLogs: [
                ...joinnedChatList[roomName].chatLogs,
                {
                  sender: "admin",
                  msg: `${userName}님의 입장이 금지 되었습니다.`,
                  time: new Date(),
                },
              ],
            },
          });
        }
      }
      setChatList(
        chatList.map((chat) => ({
          ...chat,
          count: chat.title === roomName ? chat.count - 1 : chat.count,
        }))
      );
    }
  );
};

export const listenSendDM = ({
  socket,
  myName,
  joinnedChatList,
  setJoinnedChatList,
  setCurrentChat,
}: {
  socket: any;
  myName: string;
  joinnedChatList: IJoinnedChat;
  setJoinnedChatList: any;
  setCurrentChat: any;
}) => {
  socket.on(
    "send-dm",
    ({ userName, title }: { userName: string; title: string }) => {
      const temp: IChatDetail = {
        title: title,
        type: 3,
        operator: "",
        userList: [myName, userName],
        chatLogs: [],
        banUsers: [],
        newMsg: false,
      };
      setCurrentChat(title);
      setJoinnedChatList({
        ...joinnedChatList,
        [title]: { ...temp },
      });
    }
  );
};

export const listenReceiveDM = ({
  socket,
  myName,
  joinnedChatList,
  setJoinnedChatList,
}: {
  socket: any;
  myName: string;
  joinnedChatList: IJoinnedChat;
  setJoinnedChatList: any;
}) => {
  socket.on(
    "receive-dm",
    ({ userName, title }: { userName: string; title: string }) => {
      const temp: IChatDetail = {
        title: title,
        type: 3,
        operator: "",
        userList: [myName, userName],
        chatLogs: [],
        banUsers: [],
        newMsg: false,
      };
      setJoinnedChatList({
        ...joinnedChatList,
        [title]: { ...temp },
      });
    }
  );
};

export const listenChangeOperator = ({
  socket,
  joinnedChatList,
  setJoinnedChatList,
}: {
  socket: any;
  joinnedChatList: IJoinnedChat;
  setJoinnedChatList: any;
}) => {
  socket.on(
    "chat-operator",
    ({ roomName, operator }: { roomName: string; operator: string }) => {
      setJoinnedChatList({
        ...joinnedChatList,
        [roomName]: {
          ...joinnedChatList[roomName],
          operator: operator,
          chatLogs: [
            ...joinnedChatList[roomName].chatLogs,
            {
              sender: "admin",
              msg: `${operator}님이 관리자가 되었습니다.`,
              time: new Date(),
            },
          ],
        },
      });
    }
  );
};

export function chatSocketOff(socket: any, ...rest: string[]) {
  for (let api of rest) {
    socket.off(api);
  }
}
