import styled from "@emotion/styled";
import { convertTimeForChat } from "../../CustomHooks";

const Chat = ({
  sender,
  myName,
  msg,
  time,
}: {
  sender: string;
  myName: string;
  msg: string;
  time: Date;
}) => {
  const mine = sender === myName;
  return (
    <ChatContainer>
      <Container>
        {mine ? <div /> : ""}
        <Name>{sender}</Name>
        {!mine ? <div /> : ""}
      </Container>
      <Container>
        {mine ? <div /> : ""}
        <Message mine={mine}>{msg}</Message>
        {!mine ? <div /> : ""}
      </Container>
      <Container>
        {mine ? <div /> : ""}
        <Date>{convertTimeForChat(time)}</Date>
        {!mine ? <div /> : ""}
      </Container>
    </ChatContainer>
  );
};

const Container = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Name = styled.div`
  margin: 5px;
  padding: 0 5px;
`;
const Date = styled.div`
  font-size: 0.8rem;
  margin: 0 10px;
  margin-bottom: 10px;
  color: var(--gray-color);
`;
const Message = styled.div<{ mine: boolean }>`
  max-width: 60%;
  background: blue;
  padding: 8px;
  border-radius: 10px;
  margin: 5px;
  background-color: ${({ mine }) =>
    mine ? "var(--blue-color)" : "var(--purple-color)"};
`;

const ChatContainer = styled.div`
  width: 95%;
`;

export default Chat;
