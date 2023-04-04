import styled from "@emotion/styled";
import React from "react";

const ModalBackground = ({
  onClick,
}: {
  onClick: React.MouseEventHandler<HTMLDivElement>;
}) => {
  return <ModalBackgroundContainer onClick={onClick} />;
};

const ModalBackgroundContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1;
`;
export default ModalBackground;
