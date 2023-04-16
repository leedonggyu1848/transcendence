import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { IFriendRequest } from "../../api/interface";
import { axiosGetFriendRequestList } from "../../api/request";

function convertDate(date: Date) {
  const now = new Date();

  let diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) {
    return diff + "초 전";
  }

  diff = Math.floor(diff / 60);

  if (diff < 60) {
    return diff + "분 전";
  }

  diff = Math.floor(diff / 60);

  if (diff < 24) {
    return diff + "시간 전";
  }

  diff = Math.floor(diff / 24);
  return diff + "일 전";
}

const Alarm = ({ w }: { w: number }) => {
  const data = createDummyData();
  //const [data, setData] = useState<IFriendRequest[]>([]);

  useEffect(() => {
    getRequestList();

    async function getRequestList() {
      const result = await axiosGetFriendRequestList();
      //setData([...dat])
      console.log(result);
    }
  }, []);
  return (
    <AlarmContainer w={w}>
      <Background />
      <Contents>
        <Header>Alarms</Header>
        {data.length ? (
          <AlarmList>
            {data.map(({ intra_id, type, time }, idx) => (
              <FriendRequest key={idx}>
                <Container>
                  <div>
                    <Icon type={type} />
                    <Name>{intra_id}</Name>
                  </div>
                  {type === "recv" ? (
                    <div>
                      <Button className="margin">수락</Button>
                      <Button>거절</Button>
                    </div>
                  ) : (
                    <div>
                      <Button>취소</Button>
                    </div>
                  )}
                </Container>
                <Container className="time">
                  <div />
                  <div>{convertDate(time)}</div>
                </Container>
              </FriendRequest>
            ))}
          </AlarmList>
        ) : (
          <NoFriends>
            <SmileIcon />
            <div>
              새로운 알람이
              <br />
              없습니다.
            </div>
          </NoFriends>
        )}

        {/*<AlarmList></AlarmList>*/}
      </Contents>
    </AlarmContainer>
  );
};

function createDummyData() {
  let result = [];

  const str = "abcdefghijklmnopqrstuvwxyz";

  for (let i = 0; i < 100; i++) {
    const ranType = Math.floor(Math.random() * 2);
    const randomLength = Math.floor(Math.random() * 3) + 6;
    const randomTime = Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 15);
    let name = "";
    for (let j = 0; j < randomLength; j++) {
      name += str[Math.floor(Math.random() * 26)];
    }
    result.push({
      intra_id: name,
      type: ranType ? "recv" : "send",
      time: new Date(new Date().getTime() - randomTime),
    });
  }
  return result;
}

const Icon = styled.div<{ type: string }>`
  width: 12px;
  height: 16px;
  background: ${({ type }) =>
    `url('/src/assets/${type === "send" ? "sendIcon.png" : "recvIcon.png"}')`};
  background-size: 100% 100%;
  margin-right: 10px;
`;

const Name = styled.div``;

const Container = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  & > div {
    margin: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  &:first-of-type {
    background: var(--dark-bg-color);
    border-radius: 10px;
  }

  &.time {
    font-size: 0.9rem;
    width: 90%;
    height: 15px;
  }
`;

const FriendRequest = styled.div`
  width: 90%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;
  border-radius: 10px;
  margin: 5px 10px 15px 10px;
`;

const Text = styled.div``;

const Button = styled.div`
  border-radius: 5px;
  border: 1px solid white;
  padding: 5px;
  cursor: pointer;
  &.margin {
    margin-right: 10px;
  }
`;

const SmileIcon = styled.div`
  width: 60px;
  height: 60px;
  background: url("/src/assets/smileIcon.png");
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

const AlarmList = styled.div`
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

const AlarmContainer = styled.div<{ w: number }>`
  position: absolute;
  right: 0;
  top: 155px;
  ${({ w }) => `width : ${w}px`};
  height: 510px;
  border-radius: 10px;
  color: white;
`;
export default Alarm;
