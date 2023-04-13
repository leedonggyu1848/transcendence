import styled from "@emotion/styled";
import { useRecoilState, useSetRecoilState } from "recoil";
import { alertModalState, modalBackToggleState } from "../../api/atom";

const AlertModal = () => {
  const [alertInfo, setAlertState] = useRecoilState(alertModalState);
  const setBackgroundModal = useSetRecoilState(modalBackToggleState);
  const onClickBackground = () => {
    setBackgroundModal(false);
    setAlertState({ ...alertInfo, toggle: false });
  };
  return (
    <>
      <ModalBackground onClick={onClickBackground} />
      <AlertModalContainer>
        <Icon icon={alertInfo.type} />
        <Header>{alertInfo.header}</Header>
        <Message>{alertInfo.msg}</Message>
      </AlertModalContainer>
    </>
  );
};

const ModalBackground = styled.div`
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  position: fixed;
  left: 0;
  top: 0;
  z-index: 3;
`;

const Icon = styled.div<{ icon: string }>`
  width: 100px;
  height: 100px;
  ${({ icon }) => `background-image: url(/src/assets/${icon}Icon.png)`};
  background-size: 100% 100%;
`;

const Header = styled.div`
  font-weight: bold;
  font-size: 3rem;
  margin-top: 50px;
  margin-bottom: 50px;
`;
const Message = styled.div`
  width: 80%;
  text-align: center;
  word-break: break-all;
`;

const AlertModalContainer = styled.div`
  position: fixed;
  width: 350px;
  height: 400px;
  background: var(--sub-bg-color);
  left: calc(50% - 200px);
  top: calc(50% - 200px);
  border-radius: 20px;
  z-index: 3;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  z-index: 4;
`;

export default AlertModal;
