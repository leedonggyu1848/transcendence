import styled from "@emotion/styled";
import { useSetRecoilState } from "recoil";
import { operatorModalToggleState } from "../../../api/atom";
import ModalBackground from "../../ModalBackground";
import Main from "./Main";
import Sub from "./Sub";

const OperatorModal = () => {
  const setOperatorModalToggle = useSetRecoilState(operatorModalToggleState);
  const onClickBackground = () => {
    setOperatorModalToggle(false);
  };

  return (
    <>
      <ModalBackground onClick={onClickBackground} />
      <OperatorModalContainer>
        <Main />
        <Sub />
      </OperatorModalContainer>
    </>
  );
};

const OperatorModalContainer = styled.div`
  width: 680px;
  height: 450px;
  position: fixed;
  left: calc(50% - 340px);
  top: calc(50% - 225px);
  background: var(--main-bg-color);
  border-radius: 10px;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
`;

export default OperatorModal;
