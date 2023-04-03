import styled from "@emotion/styled";

const JoinGameModal = () => {
  return <JoinGameModalContainer></JoinGameModalContainer>;
};

const JoinGameModalContainer = styled.div`
  position: fixed;
  left: 400px;
  height: 400px;
  background: var(--main-bg-color);
  left: calc(50% - 200px);
  top: calc(50% - 200px);
  border-radius: 20px;
`;

export default JoinGameModal;
