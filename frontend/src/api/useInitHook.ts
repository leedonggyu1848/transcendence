import { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { joinSocketState } from "./atom";

const useInitHook = () => {
  const setJoinSocketState = useSetRecoilState(joinSocketState);

  useEffect(() => {
    setJoinSocketState(false);
  }, []);
};

export default useInitHook;
