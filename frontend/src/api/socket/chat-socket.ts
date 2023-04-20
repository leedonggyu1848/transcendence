import { chatListState } from "../atom";
import { IChatDetail, IChatRoom, IJoinnedChat } from "../interface";
import { socket } from "../WebsocketContext";

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
  setAlertInfo,
  setJoinChatToggle,
  currentChat,
  setCurrentChat,
  chatList,
  setChatList,
  currentChatUserList,
  setCurrentChatUserList,
  joinnedChatList,
  setJoinnedChatList,
}: {
  socket: any;
  myName: string;
  setAlertInfo: any;
  setJoinChatToggle: any;
  currentChat: string;
  setCurrentChat: any;
  chatList: IChatRoom[];
  setChatList: any;
  currentChatUserList: any;
  setCurrentChatUserList: any;
  joinnedChatList: IJoinnedChat;
  setJoinnedChatList: any;
}) => {
  socket.on(
    "join-chat",
    ({
      message,
      username,
      roomName,
    }: {
      message: string;
      username: string;
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
            userList: [...joinnedChatList[roomName].userList, username],
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
      username,
      roomName,
    }: {
      message: string;
      username: string;
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
              (name) => name != username
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
      setCurrentChat(null);
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
          setCurrentChat(null);
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

export const listenChangeOperator = ({
  socket,
  currentChat,
  setCurrentChat,
  joinnedChatList,
  setJoinnedChatList,
}: {
  socket: any;
  currentChat: string;
  setCurrentChat: any;
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
