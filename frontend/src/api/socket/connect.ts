import { useRecoilState } from "recoil";
import {
  GameDto,
  IChatRoom,
  ICurrentGame,
  IFriendDto,
  IFriendRequest,
  IGameRoomInfo,
  IJoinnedChat,
  UserDto,
} from "../interface";

export const listenFirstConnection = ({ socket }: { socket: any }) => {
  socket.on("first-connection", () => {
    socket.emit("friend-request-list");
    socket.emit("friend-list");
    socket.emit("all-chat");
    socket.emit("block-list");
    socket.emit("game-list");
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

export const listenGameList = ({
  socket,
  setGameList,
}: {
  socket: any;
  setGameList: any;
}) => {
  socket.on("game-list", (games: GameDto[]) => {
    setGameList([...games]);
  });
};

export function listenNameChange({
  socket,
  myName,
  myInfo,
  setMyInfo,
  friendList,
  setFriendList,
  friendRequestList,
  setFriendRequestList,
  joinnedChatList,
  setJoinnedChatList,
  blockList,
  setBlockList,
  currentGame,
  setCurrentGame,
}: {
  socket: any;
  myName: string;
  myInfo: UserDto;
  setMyInfo: any;
  friendList: IFriendDto[];
  setFriendList: any;
  friendRequestList: IFriendRequest[];
  setFriendRequestList: any;
  joinnedChatList: IJoinnedChat;
  setJoinnedChatList: any;
  blockList: string[];
  setBlockList: any;
  currentGame: ICurrentGame | null;
  setCurrentGame: any;
}) {
  socket.on(
    "user-name",
    ({ before, after }: { before: string; after: string }) => {
      if (myName === before) {
        setMyInfo({
          ...myInfo,
          userName: after,
        });
      }
      setFriendList([
        ...friendList.map((friend) =>
          friend.userName === before
            ? { ...friend, userName: after }
            : { ...friend }
        ),
      ]);
      setFriendRequestList([
        ...friendRequestList.map((request) =>
          request.userName === before
            ? { ...request, userName: after }
            : { ...request }
        ),
      ]);
      setBlockList([
        ...blockList.map((name) => (name === before ? after : name)),
      ]);
      const temp = { ...joinnedChatList };
      Object.keys(temp).forEach((room) => {
        temp[room] = {
          ...temp[room],
          operator:
            temp[room].operator === before ? after : temp[room].operator,
          userList: temp[room].userList.map((name) =>
            name === before ? after : name
          ),
          chatLogs: temp[room].userList.includes(before)
            ? [
                ...temp[room].chatLogs,
                {
                  sender: "admin",
                  msg:
                    `${before}님의 닉네임이 ${after}로` +
                    "\n" +
                    `변경 되었습니다.`,
                  time: new Date(),
                },
              ]
            : [...temp[room].chatLogs],
        };
      });
      setJoinnedChatList({ ...temp });
      if (currentGame) {
        setCurrentGame({
          ...currentGame,
          ownerDto:
            currentGame.ownerDto.userName === before
              ? { ...currentGame.ownerDto, userName: after }
              : { ...currentGame.ownerDto },
          opponentDto: !currentGame.opponentDto
            ? null
            : currentGame.opponentDto.userName === before
            ? { ...currentGame.opponentDto, userName: after }
            : { ...currentGame.opponentDto },
          watchersDto: currentGame.watchersDto.map((user) =>
            user.userName === before
              ? { ...user, userName: after }
              : { ...user }
          ),
        });
      }
    }
  );
}

export function listenChangeProfile({
  socket,
  myName,
  myInfo,
  setMyInfo,
  friendList,
  setFriendList,
  friendRequestList,
  setFriendRequestList,
  joinnedChatList,
  setJoinnedChatList,
  blockList,
  setBlockList,
  currentGame,
  setCurrentGame,
}: {
  socket: any;
  myName: string;
  myInfo: UserDto;
  setMyInfo: any;
  friendList: IFriendDto[];
  setFriendList: any;
  friendRequestList: IFriendRequest[];
  setFriendRequestList: any;
  joinnedChatList: IJoinnedChat;
  setJoinnedChatList: any;
  blockList: string[];
  setBlockList: any;
  currentGame: ICurrentGame | null;
  setCurrentGame: any;
}) {
  socket.on(
    "user-profile",
    ({ userName, profile }: { userName: string; profile: string }) => {
      if (myName === userName) {
        setMyInfo({
          ...myInfo,
          profile,
        });
      }
      setFriendList([
        ...friendList.map((friend) =>
          friend.userName === userName ? { ...friend, profile } : { ...friend }
        ),
      ]);
      setFriendRequestList([
        ...friendRequestList.map((request) =>
          request.userName === userName
            ? { ...request, profile }
            : { ...request }
        ),
      ]);
    }
  );
}

export function chatSocketOff(socket: any, ...rest: string[]) {
  for (let api of rest) {
    socket.off(api);
  }
}
