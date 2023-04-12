import styled from "@emotion/styled";
import { UserDto } from "../../api/interface";

const DetailProfile = ({
  player,
  type,
}: {
  player: UserDto | null;
  type: string;
}) => {
  return (
    player && (
      <DetailProfileContainer>
        <Container>
          <Image src={player.profile} />
          <Intra>
            <span>{type}</span>
            <span>{player.intra_id}</span>
          </Intra>
        </Container>
        <Container>
          <Text>
            <div className="head">일반 게임</div>
            <div>
              {player.normal_win}승 {player.normal_lose}패
            </div>
            <div>
              승률 : {getWinRate(player.normal_win, player.normal_lose)}
            </div>
            <div className="head">랭크 게임</div>
            <div>
              {player.rank_win}승 {player.rank_lose}패
            </div>
            <div>승률 : {getWinRate(player.rank_win, player.rank_lose)}</div>
          </Text>
        </Container>
      </DetailProfileContainer>
    )
  );
};

function getWinRate(win: number, lose: number) {
  const result = (win / (win + lose)) * 100;
  return result.toFixed(1);
}

const Container = styled.div`
  width: 40%;
  height: 95%;
  &:first-of-type {
    margin-right: 20px;
  }
  display: flex;
  justify-content: space-around;
  flex-direction: column;
  align-items: center;
`;

const Text = styled.div`
  width: 80%;
  & > div {
    padding-left: 10px;
  }
  & > .head {
    padding-left: 0;
    margin-bottom: 5px;
    margin-top: 20px;
    font-weight: bold;
  }
  & > .head:first-of-type {
    margin-top: 0;
  }
`;
const Image = styled.div<{ src: string }>`
  background-image: ${({ src }) =>
    src
      ? `url('http://localhost:3000/${src}?v=${new Date().getTime()}')`
      : 'url("/src/assets/defaultProfile.png")'};
  width: 100%;
  padding-bottom: 100%; 
  background-size: 100% 100%;
  border-radius: 10px;
`;

const Intra = styled.div`
  font-weight: bold;
  font-size: 1.25rem;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  & > span:first-of-type {
    background: white;
    color: black;
    padding: 5px;
    font-size: 1rem;
    border-radius: 10px;
    width: 20px;
    height: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;

const DetailProfileContainer = styled.div`
  width: 95%;
  background: var(--dark-bg-color);
  height: 40%;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default DetailProfile;
