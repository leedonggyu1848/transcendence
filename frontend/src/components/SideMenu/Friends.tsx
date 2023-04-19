import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { friendListState } from "../../api/atom";
import { axiosGetFriendsList } from "../../api/request";
import Loading from "../Loading";

const Friends = ({ w }: { w: number }) => {
  const [loading, setLoading] = useState(true);
  const [friendsList, setFriendsList] = useRecoilState(friendListState);
  useEffect(() => {
    async function getFriendsList() {
      const response = await axiosGetFriendsList();
      setFriendsList([...response]);
      setLoading(false);
    }

    getFriendsList();
  }, []);
  return (
    <FriendsContainer w={w}>
      <Background />
      <Contents>
        <Header>Friends</Header>
        {loading ? (
          <div className="LoadingContainer">
            <Loading />
          </div>
        ) : friendsList.length > 0 ? (
          <FriendsList>
            {friendsList.map((friend, idx) => (
              <FriendInfo key={idx}>
                <Profile src={friend.profile} />
                <div className="name">{friend.intra_id}</div>
                <div className="buttonContainer">
                  <Message />
                  <Game />
                  <Delete />
                </div>
              </FriendInfo>
            ))}
          </FriendsList>
        ) : (
          <NoFriends>
            <CryingIcon />
            <div>
              등록된 친구가
              <br />
              없습니다.
            </div>
          </NoFriends>
        )}
      </Contents>
    </FriendsContainer>
  );
};

const Message = styled.div`
  width: 15px;
  height: 15px;
  background: url("/src/assets/messageIcon.png");
  background-size: 100% 100%;
  cursor: pointer;
`;
const Delete = styled.div`
  width: 15px;
  height: 15px;
  background: url("/src/assets/deleteIcon.png");
  background-size: 100% 100%;
  cursor: pointer;
`;
const Game = styled.div`
  width: 15px;
  height: 15px;
  background: url("/src/assets/PongIcon.png");
  background-size: 100% 100%;
  cursor: pointer;
`;

const Profile = styled.div<{ src: string }>`
  width: 35px;
  height: 35px;
  border-radius: 10px;
  background-size: 100% 100%;
  background-image: ${({ src }) =>
    src
      ? `url('http://localhost:3000/${src}/?v=${new Date().getTime()}')`
      : "url(/src/assets/defaultProfile.png)"};
`;

const FriendInfo = styled.div`
  width: 100%;
  height: 50px;
  background: var(--dark-bg-color);
  margin: 5px 0px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 10px;
  & > div {
    margin: 0 10px;
  }

  & > .buttonContainer {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  & > .buttonContainer > div {
    margin-left: 10px;
    border-radius: 5px;
    padding: 5px 5px;
    cursor: pointer;
  }

  & > .name {
    width: 70px;
  }
`;

function createDummyData() {
  let result = [];

  const str = "abcdefghijklmnopqrstuvwxyz";

  for (let i = 0; i < 100; i++) {
    const randomLength = Math.floor(Math.random() * 3) + 6;
    let name = "";
    for (let j = 0; j < randomLength; j++) {
      name += str[Math.floor(Math.random() * 26)];
    }
    result.push(name);
  }
  return result;
}

const CryingIcon = styled.div`
  width: 60px;
  height: 60px;
  background: url("/src/assets/cryingIcon.png");
  background-size: 100% 100%;
  margin-bottom: 25px;
`;

const NoFriends = styled.div`
  font-size: 1.25rem;
  width: 90%;
  height: 80%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  line-height: 30px;
`;

const FriendsList = styled.div`
  width: 90%;
  height: 80%;
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

const Contents = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  & .LoadingContainer {
    width: 90%;
    height: 80%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;

const Header = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  width: 80%;
  margin-bottom: 25px;
`;

const Background = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  background: var(--sub-bg-color);
  opacity: 0.95;
  border-radius: 10px;
`;

const FriendsContainer = styled.div<{ w: number }>`
  position: absolute;
  right: 0;
  top: 155px;
  ${({ w }) => `width : ${w}px`};
  height: 510px;
  border-radius: 10px;
  color: white;
`;

export default Friends;
