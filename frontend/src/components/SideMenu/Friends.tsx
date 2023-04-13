import styled from "@emotion/styled";

const Friends = ({ w }: { w: number }) => {
  console.log(w);
  return (
    <FriendsContainer w={w}>
      <Background />
      <Contents>
        <Header>Friends</Header>
        <NoFriends>
          <CryingIcon />
          <div>
            등록된 친구가
            <br />
            없습니다.
          </div>
        </NoFriends>
        {/*<FriendsList></FriendsList>*/}
      </Contents>
    </FriendsContainer>
  );
};

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
  background: black;
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
