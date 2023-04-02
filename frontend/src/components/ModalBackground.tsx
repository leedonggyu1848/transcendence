import styled from "@emotion/styled";

const ModalBackground = () => <ModalBackgroundContainer />;

const ModalBackgroundContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1;
`;
export default ModalBackground;
