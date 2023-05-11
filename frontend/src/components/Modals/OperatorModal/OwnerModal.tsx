import styled from "@emotion/styled";
import { useSetRecoilState } from "recoil";
import { ownerModalToggleState } from "../../../api/atom";
import ModalBackground from "../../ModalBackground";
import Admins from "./Admins";
import Main from "./Main";
import Sub from "./Sub";

const OwnerModal = () => {
  const setOwnerModal = useSetRecoilState(ownerModalToggleState);
  const onClickBackground = () => {
    setOwnerModal(false);
  };

  return (
    <>
      <ModalBackground onClick={onClickBackground} />
      <OwnerModalContainer>
        <Main head="Owner" />
        <Admins />
        <Sub />
      </OwnerModalContainer>
    </>
  );
};

const OwnerModalContainer = styled.div`
  width: 900px;
  height: 450px;
  position: fixed;
  left: calc(50% - 450px);
  top: calc(50% - 225px);
  background: var(--main-bg-color);
  border-radius: 10px;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
`;

export default OwnerModal;
