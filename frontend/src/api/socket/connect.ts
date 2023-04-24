import { IChatRoom, IFriendDto, IFriendRequest } from "../interface";

export const listenFirstConnection = ({ socket }: { socket: any }) => {
  socket.on("first-connection", () => {
    socket.emit("friend-request-list");
    socket.emit("friend-list");
    socket.emit("all-chat");
    socket.emit("block-list");
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
  socket.on("connect-user", ({ userName }: { userName: string }) => {
    setFriendList(
      friendList.map((friend: IFriendDto) =>
        friend.userName === userName ? { ...friend, status: 1 } : { ...friend }
      )
    );
  });
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

export const listenCheckConnection = ({
  socket,
  friendList,
  setFriendList,
}: {
  socket: any;
  friendList: any;
  setFriendList: any;
}) => {
  socket.on(
    "check-connection",
    ({ userName, isConnect }: { userName: string; isConnect: number }) => {
      console.log("isConnect", userName, isConnect);
      if (isConnect) {
        setFriendList(
          friendList.map((friend: IFriendDto) =>
            friend.userName === userName
              ? { ...friend, status: isConnect }
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

export const listenBlockList = ({
  socket,
  setBlockList,
}: {
  socket: any;
  setBlockList: any;
}) => {
  socket.on("block-list", (list: string[]) => {
    setBlockList([...list]);
  });
};

export function chatSocketOff(socket: any, ...rest: string[]) {
  for (let api of rest) {
    socket.off(api);
  }
}
