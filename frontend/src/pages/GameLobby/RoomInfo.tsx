import styled from "@emotion/styled";
import { axiosPostFlush } from "../../api/request";

const RoomInfo = ({
  title,
  private_mode,
  interrupt_mode,
  cur,
  clickWatch,
  clickJoin,
}: {
  title: string;
  private_mode: boolean;
  interrupt_mode: boolean;
  cur: number;
  clickWatch: React.MouseEventHandler;
  clickJoin: Function;
}) => {
  const flushData = (title: string) => {
    axiosPostFlush(title);
  };
  return (
    <RoomInfoContainer>
      <InterruptMode interruptMode={interrupt_mode} />
      <Private private_mode={private_mode} />
      <Name title={title} onClick={() => flushData(title)}>
        {title.slice(0, 17)}
        {title.length > 17 ? "..." : ""}
      </Name>
      <Current>{cur} / 2</Current>
      {cur === 1 ? (
        <Button onClick={() => clickJoin(title, private_mode)}>참가</Button>
      ) : (
        <Empty />
      )}
      <Button onClick={clickWatch}>관전</Button>
    </RoomInfoContainer>
  );
};

const InterruptMode = styled.div<{ interruptMode: boolean }>`
  width: 23px;
  height: 20px;
  background-image: ${({ interruptMode }) =>
    interruptMode ? 'url("/src/assets/ObstacleIcon.png")' : "none"};
  background-size: 100% 100%;
  margin-left: 10px;
`;

const Empty = styled.div`
  width: 42px;
  height: 100%;
`;

const Button = styled.div`
  border: 1px solid white;
  padding: 5px;
  border-radius: 5px;
  cursor: pointer;
  width: 30px;
`;

const Private = styled.div<{ private_mode: boolean }>`
  width: 15px;
  height: 20px;
  background-image: ${({ private_mode }) =>
    private_mode ? 'url("/src/assets/lockIcon.png")' : "none"};
  background-size: 100% 100%;
`;
const Name = styled.div`
  width: 50%;
  height: 100%;
  display: flex;
  align-items: center;
`;

const Current = styled.div``;

const RoomInfoContainer = styled.div`
  width: 92%;
  height: 40px;
  background: var(--main-bg-color);
  margin: 0 auto;
  margin-bottom: 10px;
  border-radius: 10px;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export default RoomInfo;
