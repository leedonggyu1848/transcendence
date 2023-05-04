import { createContext } from "react";
import { io, Socket } from "socket.io-client";
import MainPage from "./MainPage";

export const socket = io("http://localhost:3000/GameChat");
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
