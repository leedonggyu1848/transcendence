import styled from "@emotion/styled";
import { useContext, useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { banUserListState, currentChatState } from "../../../api/atom";
import { WebsocketContext } from "../../../api/WebsocketContext";

const userList = [
  "jpark2",
  "yooh",
  "sanan",
  "dongglee",
  "sunwsong",
  "mingkang",
  "hyungnoh",
  "jdoh",
  "seonghyu",
  "jnho",
  "heejikim",
  "inshin",
  "jaesejeon",
  "eunbikim",
];

const Sub = () => {
  const socket = useContext(WebsocketContext);
  const currentChat = useRecoilValue(currentChatState);
  const [banUserList, setBanUserList] = useRecoilState(banUserListState);

  useEffect(() => {
    if (!currentChat) return;
    socket.emit("ban-list", currentChat.title);

    socket.on("ban-list", (users: string[]) => {
      if (!currentChat) return;
      setBanUserList({ ...banUserList, [currentChat.title]: users.slice() });
    });

    socket.on(
      "ban-user",
      ({ userName, roomName }: { userName: string; roomName: string }) => {
        setBanUserList({
          ...banUserList,
          [roomName]: [...banUserList[roomName], userName],
        });
      }
    );
    return () => {
      socket.off("ban-list");
      socket.off("ban-user");
    };
  }, []);

  useEffect(() => {}, []);
  return (
    <SubContainer>
      <Header>Ban List</Header>
      <BanList>
        {currentChat &&
          banUserList[currentChat.title] &&
          banUserList[currentChat.title].map((user, idx) => (
            <User key={idx}>
              <Name>{user}</Name>
              <ButtonContainer>
                <Button>해제</Button>
              </ButtonContainer>
            </User>
          ))}
      </BanList>
    </SubContainer>
  );
};

const User = styled.div`
  width: 90%;
  height: 60px;
  background: var(--dark-bg-color);
  margin: 0 auto;
  margin-top: 5px;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const ButtonContainer = styled.div`
  display: flex;
`;
const Button = styled.div`
  border-radius: 10px;
  background: white;
  color: black;
  padding: 5px 10px;
  margin-right: 10px;
  cursor: pointer;
`;
const Name = styled.div`
  padding: 10px;
  margin-left: 10px;
`;

const BanList = styled.div`
  width: 90%;
  height: 300px;
  background: var(--sub-bg-color);
  border-radius: 10px;
  overflow-y: auto;
  &::-webkit-scrollbar {
    border-radius: 10px;
    width: 10px;
  }
  &::-webkit-scrollbar-track {
    background: white;
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--gray-color);
    width: 2px;
    border-radius: 10px;
  }
`;

const Header = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  width: 85%;
  margin-top: 40px;
  margin-bottom: 70px;
`;

const SubContainer = styled.div`
  width: 250px;
  height: 100%;
  background: var(--main-bg-color);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export default Sub;
