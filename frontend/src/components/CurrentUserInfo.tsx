import styled from "@emotion/styled";
import { JoinnedUserDto } from "../api/interface";

const CurrentUserInfo = ({ data }: { data: JoinnedUserDto[] }) => {
  return (
    <CurrentUserInfoContainer>
      <Title>참여중인 사람 : {data.length}명</Title>
      <UserNameContainer>
        {data.map(({ intra_id, type }, idx) => (
          <UserName key={idx} className={type}>
            {intra_id}
          </UserName>
        ))}
      </UserNameContainer>
    </CurrentUserInfoContainer>
  );
};

const Title = styled.div`
  font-size: 1.1rem;
  width: 90%;
  margin-bottom: 10px;
`;

const UserNameContainer = styled.div`
  width: 95%;
  height: 100px;
  overflow-y: auto;
  border-radius: 10px;
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

const UserName = styled.div`
  display: inline-block;
  padding: 5px 10px;
  border-radius: 10px;
  padding: 10px;
  margin: 5px;
  &.watcher {
    background: var(--main-bg-color);
  }
  &.owner {
    background: var(--blue-color);
  }
  &.opponent {
    background: var(--purple-color);
  }
`;

const CurrentUserInfoContainer = styled.div`
  width: 100%;
  height: 150px;
  border-radius: 10px;
  margin-bottom: 20px;
  background: var(--sub-bg-color);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

export default CurrentUserInfo;
