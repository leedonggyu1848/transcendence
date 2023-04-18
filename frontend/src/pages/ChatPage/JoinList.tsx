import styled from "@emotion/styled";
import { IChatRoom, JoinListDto } from "../../api/interface";

const JoinList = ({ data }: { data: IChatRoom[] }) => {
  return (
    <JoinListContainer>
      {data.map(({ title, type }, idx) => (
        <Room key={idx}>
          {true ? <NewMessage /> : <Empty />}
          <Private private_mode={type} />
          <Title title={title.slice(1)}>
            {title.slice(1, 10)}
            {title.length > 10 ? "..." : ""}
          </Title>
          <LeaveButton>나가기</LeaveButton>
        </Room>
      ))}
    </JoinListContainer>
  );
};

const Empty = styled.div`
  width: 7px;
  height: 7px;
  margin-left: 10px;
`;

const NewMessage = styled.div`
  width: 7px;
  height: 7px;
  border-radius: 10px;
  background: #ff4a4a;
  margin-left: 10px;
`;

const LeaveButton = styled.div`
  padding: 5px 8px;
  color: white;
  border: 1px solid white;
  border-radius: 10px;
  cursor: pointer;
`;

const Private = styled.div<{ private_mode: number }>`
  width: 15px;
  height: 15px;
  background-image: ${({ private_mode }) =>
    private_mode === 2
      ? 'url("/src/assets/lockIcon.png")'
      : private_mode === 1
      ? 'url("/src/assets/privateIcon.png")'
      : "none"};
  background-size: 100% 100%;
`;

const Title = styled.div`
  width: 55%;
`;

const Room = styled.div`
  width: 95%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  margin: 5px;
`;

const JoinListContainer = styled.div`
  width: 100%;
  height: 510px;
  background: var(--sub-bg-color);
  border-radius: 10px;
  overflow-y: auto;
  color: white;
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

export default JoinList;
