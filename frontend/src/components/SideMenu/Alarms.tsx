import styled from "@emotion/styled";
import React, { useEffect, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { alertModalState, friendRequestListState } from "../../api/atom";
import { IFriendRequest } from "../../api/interface";
import {
  axiosAcceptFriendRequest,
  axiosGetFriendRequestList,
} from "../../api/request";

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
  //const data = createDummyData();
  const [data, setData] = useState<IFriendRequest[]>([]);
  const friendRequestList = useRecoilValue(friendRequestListState);
  const setAlertInfo = useSetRecoilState(alertModalState);

  const acceptRequest = async (intra_id: string) => {
    try {
      await axiosAcceptFriendRequest(intra_id);
      console.log("hello");
    } catch (e) {
      console.error(e);
      setAlertInfo({
        type: "failure",
        header: "게임 참가 실패",
        msg: "게임 참가에 실패 했습니다...",
        toggle: true,
      });
    }
  };

  return (
    <AlarmContainer w={w}>
      <Background />
      <Contents>
        <Header>Alarms</Header>
        {friendRequestList.length > 0 ? (
          <AlarmList>
            {friendRequestList.map(({ intra_id, time, type }, idx) => (
              <FriendRequest key={idx}>
                <Container>
                  <div>
                    <Icon type={type ? "recv" : "send"} />
                    <Name>{intra_id}</Name>
                  </div>
                  {type ? (
                    <div>
                      <Button
                        className="margin"
                        onClick={() => acceptRequest(intra_id)}
                      >
                        수락
                      </Button>
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
                  <div>{convertDate(new Date(time))}</div>
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
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;
  border-radius: 10px;
  margin-bottom: 10px;
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
