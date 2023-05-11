import {
  IChatDetail,
  ICombinedRequestAndInvite,
  IFriendDto,
  IFriendRequest,
  IJoinnedChat,
} from "../interface";

export const listenCancelFriend = ({
  socket,
  setFriendRequestList,
  friendRequestList,
}: {
  socket: any;
  setFriendRequestList: any;
  friendRequestList: any;
}) => {
  socket.on("cancel-friend", ({ userName }: { userName: string }) => {
    console.log("cancel-friend", userName);
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
  setFriendRequestList,
  friendRequestList,
}: {
  socket: any;
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
          (request: ICombinedRequestAndInvite) => request.userName !== userName
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
          (request: ICombinedRequestAndInvite) => request.userName !== userName
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

export const listenSendDM = ({
  socket,
  myName,
  joinnedChatList,
  setJoinnedChatList,
  setCurrentChat,
  location,
  navigate,
}: {
  socket: any;
  myName: string;
  joinnedChatList: IJoinnedChat;
  setJoinnedChatList: any;
  setCurrentChat: any;
  location: Location;
  navigate: any;
}) => {
  socket.on(
    "send-dm",
    ({ userName, title }: { userName: string; title: string }) => {
      const temp: IChatDetail = {
        title: title,
        type: 3,
        owner: "",
        userList: [myName, userName],
        chatLogs: [],
        banUsers: [],
        admins: [],
        newMsg: false,
        isMuted: false,
        muteId: -1,
      };
      setCurrentChat(title);
      setJoinnedChatList({
        ...joinnedChatList,
        [title]: { ...temp },
      });
      if (location.pathname !== "/main/chat") {
        navigate("/main/chat");
      }
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
        owner: "",
        userList: [myName, userName],
        chatLogs: [],
        banUsers: [],
        admins: [],
        newMsg: false,
        isMuted: false,
        muteId: -1,
      };
      setJoinnedChatList({
        ...joinnedChatList,
        [title]: { ...temp },
      });
    }
  );
};
