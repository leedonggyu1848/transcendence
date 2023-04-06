import styled from "@emotion/styled";
import { JoinnedUserDto } from "../api/interface";

const CurrentUserInfo = ({
  data,
  title,
  operator,
  clickOperatorButton,
}: {
  data: JoinnedUserDto[];
  title: string;
  operator: boolean;
  clickOperatorButton: Function;
}) => {
  return (
    <CurrentUserInfoContainer>
      <HeaderContainer>
        <Title>
          {title.slice(0, 13)}
          {title.length > 13 ? "..." : ""}
        </Title>
        <InfoContainer>
          {operator && <OperatorIcon />}
          <UserIcon />
          {data.length}
        </InfoContainer>
      </HeaderContainer>
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

const OperatorIcon = styled.div`
  background-image: url("/src/assets/adminIcon.png");
  width: 15px;
  height: 15px;
  background-size: 100% 100%;
  cursor: pointer;
  margin-right: 10px;
`;

const UserIcon = styled.div`
  background-image: url("/src/assets/userIcon.png");
  width: 15px;
  height: 15px;
  background-size: 100% 100%;
  margin-right: 10px;
`;

const InfoContainer = styled.div`
  display: flex;
  align-items: center;
`;

const HeaderContainer = styled.div`
  width: 90%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.div`
  font-size: 1.1rem;
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
