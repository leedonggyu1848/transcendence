import styled from "@emotion/styled";
import { useEffect, useState } from "react";

function getTime(timer: number) {
  const m = Math.floor(timer / 60);
  const s = timer % 60 > 10 ? timer % 60 : "0" + (timer % 60);
  return m + ":" + s;
}

const Counter = ({
  setTimeOver,
}: {
  setTimeOver: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [timer, setTimer] = useState(300);

  useEffect(() => {
    if (timer === 0) {
      setTimeOver(true);
      return;
    }
    const timeoutID = setTimeout(() => {
      setTimer(timer - 1);
    }, 1000);

    return () => {
      clearTimeout(timeoutID);
    };
  }, [timer]);
  return <CounterCountainer>{getTime(timer)}</CounterCountainer>;
};

const CounterCountainer = styled.div`
  margin-top: 35px;
  font-size: 2rem;
  letter-spacing: 5px;
  margin-bottom: 10px;
`;

export default Counter;
