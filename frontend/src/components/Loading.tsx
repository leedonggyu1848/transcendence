import styled from "@emotion/styled";

const Loading = () => {
  return (
    <LoadingContainer className="lds-default">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </LoadingContainer>
  );
};

const LoadingContainer = styled.div`
  &.lds-default {
    display: inline-block;
    position: relative;
    width: 80px;
    height: 80px;
  }
  &.lds-default div {
    position: absolute;
    width: 6px;
    height: 6px;
    background: #fff;
    border-radius: 50%;
    animation: lds-default 1.2s linear infinite;
  }
  &.lds-default div:nth-of-type(1) {
    animation-delay: 0s;
    top: 37px;
    left: 66px;
  }
  &.lds-default div:nth-of-type(2) {
    animation-delay: -0.1s;
    top: 22px;
    left: 62px;
  }
  &.lds-default div:nth-of-type(3) {
    animation-delay: -0.2s;
    top: 11px;
    left: 52px;
  }
  &.lds-default div:nth-of-type(4) {
    animation-delay: -0.3s;
    top: 7px;
    left: 37px;
  }
  &.lds-default div:nth-of-type(5) {
    animation-delay: -0.4s;
    top: 11px;
    left: 22px;
  }
  &.lds-default div:nth-of-type(6) {
    animation-delay: -0.5s;
    top: 22px;
    left: 11px;
  }
  &.lds-default div:nth-of-type(7) {
    animation-delay: -0.6s;
    top: 37px;
    left: 7px;
  }
  &.lds-default div:nth-of-type(8) {
    animation-delay: -0.7s;
    top: 52px;
    left: 11px;
  }
  &.lds-default div:nth-of-type(9) {
    animation-delay: -0.8s;
    top: 62px;
    left: 22px;
  }
  &.lds-default div:nth-of-type(10) {
    animation-delay: -0.9s;
    top: 66px;
    left: 37px;
  }
  &.lds-default div:nth-of-type(11) {
    animation-delay: -1s;
    top: 62px;
    left: 52px;
  }
  &.lds-default div:nth-of-type(12) {
    animation-delay: -1.1s;
    top: 52px;
    left: 62px;
  }
  @keyframes lds-default {
    0%,
    20%,
    80%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.5);
    }
  }
`;

export default Loading;
