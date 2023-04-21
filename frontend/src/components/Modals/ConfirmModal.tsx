import styled from "@emotion/styled";
import { useRecoilState } from "recoil";
import { confirmModalToggleState } from "../../api/atom";

const ConfirmModal = () => {
  const [confirmModalState, setConfirmModalState] = useRecoilState(
    confirmModalToggleState
  );

  const clickCancel = () => {
    setConfirmModalState({
      msg: "",
      toggle: false,
      confirmFunc: () => {},
    });
  };

  return (
    <>
      <ModalBackground onClick={clickCancel} />
      <ConfirmModalContainer>
        <ConfirmIcon />
        <Message>{confirmModalState.msg}</Message>
        <ButtonContainer>
          <Button className="confirm" onClick={confirmModalState.confirmFunc}>
            확인
          </Button>
          <Button className="cancel" onClick={clickCancel}>
            취소
          </Button>
        </ButtonContainer>
      </ConfirmModalContainer>
    </>
  );
};

const ConfirmIcon = styled.div`
  width: 150px;
  height: 150px;
  background: url("/src/assets/confirmIcon.png");
  background-size: 100% 100%;
`;
const Message = styled.div`
  margin: 45px;
  font-size: 1.25rem;
  width: 50%;
  word-break: break-word;
  text-align: center;
  line-height: 50px;
`;

const ButtonContainer = styled.div`
  width: 60%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Button = styled.div`
  width: 100px;
  height: 50px;
  display: flex;
  font-size: 1.25rem;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  cursor: pointer;
  &.confirm {
    background: white;
    color: var(--dark-bg-color);
  }
  &.cancel {
    border: 1px solid white;
  }
`;

const ModalBackground = styled.div`
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  position: fixed;
  left: 0;
  top: 0;
  z-index: 3;
`;

const ConfirmModalContainer = styled.div`
  width: 400px;
  height: 500px;
  position: fixed;
  left: calc(50% - 200px);
  top: calc(50% - 250px);
  z-index: 4;
  background: var(--main-bg-color);
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  color: white;
`;

export default ConfirmModal;
