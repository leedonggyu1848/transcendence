import styled from "@emotion/styled";
import { JoinListDto } from "../../api/interface";

const JoinList = ({ data }: { data: JoinListDto[] }) => {
  return (
    <JoinListContainer>
      {data.map(({ title, private_mode, newMessage }, idx) => (
        <Room>
          <Private private_mode={private_mode} />
          <Title>
            {title.slice(0, 10)}
            {title.length > 10 ? "..." : ""}
          </Title>
          <NewMessage>{newMessage > 0 ? newMessage : ""}</NewMessage>
        </Room>
      ))}
    </JoinListContainer>
  );
};

const Private = styled.div<{ private_mode: boolean }>`
  width: 15px;
  height: 18px;
  background-image: ${({ private_mode }) =>
    private_mode ? 'url("/src/assets/lockIcon.png")' : "none"};
  background-size: 100% 100%;
`;

const Title = styled.div`
  width: 60%;
`;

const NewMessage = styled.div``;

const Room = styled.div`
  width: 85%;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
