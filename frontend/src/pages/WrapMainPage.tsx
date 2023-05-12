import { createContext } from "react";
import { io, Socket } from "socket.io-client";
import MainPage from "./MainPage";

export const socket = io(import.meta.env.VITE_FRONT_ADDRESS + "/GameChat");
export const WebsocketContext = createContext<Socket>(socket);
export const WebsocketProvider = WebsocketContext.Provider;

const WrappedMainPage = () => {
  return (
    <WebsocketProvider value={socket}>
      <MainPage />
    </WebsocketProvider>
  );
};

export default WrappedMainPage;
