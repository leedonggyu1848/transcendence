import Admins from "../../components/Modals/OperatorModal/Admins";
import {
  IChatDetail,
  IChatRoom,
  ICombinedRequestAndInvite,
  IFriendRequest,
  IJoinnedChat,
} from "../interface";

export const listenMessage = ({
  socket,
  joinnedChatList,
  setJoinnedChatList,
  currentChat,
  blockList,
}: {
  currentChat: any;
  socket: any;
  joinnedChatList: any;
  setJoinnedChatList: any;
  blockList: any;
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
      if (blockList.includes(userName)) return;
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
      owner,
      admins,
      users,
    }: {
      roomName: string;
      type: number;
      owner: string;
      admins: string[];
      users: string[];
    }) => {
      console.log("create-chat", roomName, type, owner, admins, users);
      const temp: IChatRoom = {
        title: roomName,
        type,
        owner,
        count: 1,
      };
      setChatList([...chatList, temp]);
      const detailTemp: IChatDetail = {
        title: roomName,
        type,
        owner,
        userList: [myName],
        chatLogs: [],
        admins: [],
        banUsers: [],
        newMsg: false,
        isMuted: false,
        muteId: -1,
      };
      if (owner === myName) {
        setCurrentChat(roomName);
        setJoinnedChatList({
          ...joinnedChatList,
          [roomName]: { ...detailTemp },
        });
      }
    }
  );
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
  location,
  navigate,
}: {
  myName: string;
  socket: any;
  setCurrentChat: any;
  chatList: IChatRoom[];
  setChatList: any;
  joinnedChatList: IJoinnedChat;
  setJoinnedChatList: any;
  location: Location;
  navigate: any;
}) => {
  socket.on(
    "join-chat-success",
    ({
      roomName,
      type,
      owner,
      users,
      admins,
    }: {
      roomName: string;
      type: number;
      owner: string;
      users: string[];
      admins: string[];
    }) => {
      console.log("join-chat-success", users, admins);
      const temp: IChatDetail = {
        title: roomName,
        type,
        owner,
        userList: [...users, myName],
        admins: [...admins],
        chatLogs: [],
        banUsers: [],
        newMsg: false,
        isMuted: false,
        muteId: -1,
      };
      setJoinnedChatList({ ...joinnedChatList, [roomName]: { ...temp } });
      setCurrentChat(roomName);
      setChatList(
        chatList.map((chat) => ({
          ...chat,
          count: chat.title === roomName ? chat.count + 1 : chat.count,
        }))
      );
      if (location.pathname !== "/main/chat") navigate("/main/chat");
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
      owner,
    }: {
      message: string;
      userName: string;
      roomName: string;
      owner: string;
    }) => {
      console.log(owner, joinnedChatList);
      setChatList(
        chatList
          .map((chat) => ({
            ...chat,
            count: chat.title === roomName ? chat.count - 1 : chat.count,
          }))
          .filter((chat) => chat.count !== 0)
      );
      if (joinnedChatList[roomName]) {
        const tempAdmin = joinnedChatList[roomName].admins.filter(
          (name) => name !== userName
        );
        if (!tempAdmin.includes(owner)) tempAdmin.push(owner);
        setJoinnedChatList({
          ...joinnedChatList,
          [roomName]: {
            ...joinnedChatList[roomName],
            userList: joinnedChatList[roomName].userList.filter(
              (name) => name != userName
            ),
            owner,
            admins: tempAdmin,
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
            admins: joinnedChatList[roomName].admins.filter(
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
      if (userName === myName && joinnedChatList[roomName]) {
        if (currentChat === roomName) {
          setCurrentChat("");
        }
        const temp: IJoinnedChat = {
          ...joinnedChatList,
        };
        delete temp[roomName];
        setJoinnedChatList({ ...temp });
      }
      if (userName !== myName && joinnedChatList[roomName]) {
        setJoinnedChatList({
          ...joinnedChatList,
          [roomName]: {
            ...joinnedChatList[roomName],
            userList: joinnedChatList[roomName].userList.filter(
              (name) => name !== userName
            ),
            banUsers: [...joinnedChatList[roomName].banUsers, userName],
            admins: joinnedChatList[roomName].admins.filter(
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
      setChatList(
        chatList.map((chat) => ({
          ...chat,
          count: chat.title === roomName ? chat.count - 1 : chat.count,
        }))
      );
    }
  );
};

export const listenBanCancel = ({
  socket,
  joinnedChatList,
  setJoinnedChatList,
}: {
  socket: any;
  joinnedChatList: IJoinnedChat;
  setJoinnedChatList: any;
}) => {
  socket.on(
    "ban-cancel",
    ({ userName, roomName }: { userName: string; roomName: string }) => {
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
              msg: `${userName}님의 입장 금지가 풀렸습니다.`,
              time: new Date(),
            },
          ],
        },
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

export const listenBlockUser = ({
  socket,
  blockList,
  setBlockList,
  setAlertInfo,
  currentChat,
  joinnedChatList,
  setJoinnedChatList,
}: {
  socket: any;
  blockList: string[];
  setBlockList: any;
  setAlertInfo: any;
  currentChat: string;
  joinnedChatList: IJoinnedChat;
  setJoinnedChatList: any;
}) => {
  socket.on("block-user", (userName: string) => {
    setAlertInfo({
      type: "success",
      header: "",
      msg: `${userName}님을 차단했습니다`,
      toggle: true,
    });
    setJoinnedChatList({
      ...joinnedChatList,
      [currentChat]: {
        ...joinnedChatList[currentChat],
        chatLogs: [...joinnedChatList[currentChat].chatLogs],
      },
    });
    setBlockList([...blockList, userName]);
  });
};

export const listenUnBlockUser = ({
  socket,
  blockList,
  setBlockList,
  currentChat,
  joinnedChatList,
  setJoinnedChatList,
}: {
  socket: any;
  blockList: string[];
  setBlockList: any;
  currentChat: string;
  joinnedChatList: IJoinnedChat;
  setJoinnedChatList: any;
}) => {
  socket.on("block-cancel", (userName: string) => {
    setJoinnedChatList({
      ...joinnedChatList,
      [currentChat]: {
        ...joinnedChatList[currentChat],
        chatLogs: [...joinnedChatList[currentChat].chatLogs],
      },
    });
    setBlockList(blockList.filter((name) => name !== userName));
  });
};

export const listenMuteUser = ({
  socket,
  setAlertInfo,
}: {
  socket: any;
  setAlertInfo: any;
}) => {
  socket.on(
    "mute-user",
    ({ roomName, userName }: { roomName: string; userName: string }) => {
      setAlertInfo({
        type: "success",
        header: "",
        msg: `${roomName}에서 ${userName}을 음소거 했습니다.`,
        toggle: true,
      });
    }
  );
};

export const listenChatMuted = ({
  socket,
  joinnedChatList,
  setJoinnedChatList,
  setMuteFlag,
}: {
  socket: any;
  joinnedChatList: any;
  setJoinnedChatList: any;
  setMuteFlag: any;
}) => {
  socket.on("chat-muted", (roomName: string) => {
    clearTimeout(joinnedChatList[roomName].mutedId);

    const timeoutId = setTimeout(() => {
      setJoinnedChatList((prevJoinnedChatList: IJoinnedChat) => ({
        ...prevJoinnedChatList,
        [roomName]: {
          ...prevJoinnedChatList[roomName],
          chatLogs: [
            ...prevJoinnedChatList[roomName].chatLogs,
            {
              sender: "admin",
              msg: `${roomName}에서 음소거가 풀렸습니다.`,
              time: new Date(),
            },
          ],
          isMuted: false,
        },
      }));
    }, 30000);
    setJoinnedChatList({
      ...joinnedChatList,
      [roomName]: {
        ...joinnedChatList[roomName],
        chatLogs: [
          ...joinnedChatList[roomName].chatLogs,
          {
            sender: "admin",
            msg: `${roomName}에서 음소거 되었습니다.`,
            time: new Date(),
          },
        ],
        isMuted: true,
        muteId: timeoutId,
      },
    });
  });
};

export const listenChatInvite = ({
  socket,
  friendRequestList,
  setFriendRequestList,
  myName,
}: {
  socket: any;
  friendRequestList: ICombinedRequestAndInvite[];
  setFriendRequestList: any;
  myName: string;
}) => {
  socket.on(
    "chat-invite",
    ({ userName, roomName }: { userName: string; roomName: string }) => {
      if (myName === userName) return;
      setFriendRequestList([
        ...friendRequestList,
        { userName, roomName, inviteType: "채팅" },
      ]);
    }
  );
};

export const listenChatReject = ({
  socket,
  friendRequestList,
  setFriendRequestList,
  myName,
  setAlertInfo,
}: {
  socket: any;
  setFriendList: IFriendRequest[];
  setRequestFriendListFlag: any;
  friendRequestList: ICombinedRequestAndInvite[];
  setFriendRequestList: any;
  myName: string;
  setAlertInfo: any;
}) => {
  socket.on(
    "chat-reject",
    ({ userName, roomName }: { userName: string; roomName: string }) => {
      if (userName !== myName) {
        setAlertInfo({
          type: "failure",
          header: "",
          msg: `${userName}님이 초대를 거절했습니다`,
          toggle: true,
        });
      } else {
        setFriendRequestList(
          friendRequestList.filter(
            (list) =>
              !(list.inviteType === "채팅" && list.roomName === roomName)
          )
        );
      }
    }
  );
};

export const listenChatAddAdmin = ({
  socket,
  joinnedChatList,
  setJoinnedChatList,
  currentChat,
}: {
  socket: any;
  joinnedChatList: IJoinnedChat;
  setJoinnedChatList: any;
  currentChat: string;
}) => {
  socket.on(
    "chat-add-admin",
    ({ roomName, userName }: { roomName: string; userName: string }) => {
      console.log("chat-add-admin", userName, roomName, joinnedChatList);
      setJoinnedChatList({
        ...joinnedChatList,
        [roomName]: {
          ...joinnedChatList[roomName],
          admins: [...joinnedChatList[roomName].admins, userName],
        },
      });
    }
  );
};

export const listenChatDelAdmin = ({
  socket,
  joinnedChatList,
  setJoinnedChatList,
  currentChat,
}: {
  socket: any;
  joinnedChatList: IJoinnedChat;
  setJoinnedChatList: any;
  currentChat: string;
}) => {
  socket.on(
    "chat-del-admin",
    ({ roomName, userName }: { roomName: string; userName: string }) => {
      console.log("chat-del-admin", userName, roomName);
      setJoinnedChatList({
        ...joinnedChatList,
        [roomName]: {
          ...joinnedChatList[roomName],
          admins: joinnedChatList[roomName].admins.filter(
            (name) => name !== userName
          ),
        },
      });
    }
  );
};

export const listChatPassword = ({
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
    "chat-password",
    ({ roomName, type }: { roomName: string; type: number }) => {
      setChatList(
        chatList.map((chat) =>
          chat.title === roomName ? { ...chat, type } : { ...chat }
        )
      );
      if (joinnedChatList[roomName]) {
        setJoinnedChatList({
          ...joinnedChatList,
          [roomName]: {
            ...joinnedChatList[roomName],
            type,
          },
        });
      }
    }
  );
};
