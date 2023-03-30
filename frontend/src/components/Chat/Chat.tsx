import styled from "@emotion/styled";

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
    <ChatContainer mine={mine}>
      {mine ? (
        <HeaderSection>
          <Date></Date>
          <Name>{sender}</Name>
        </HeaderSection>
      ) : (
        <HeaderSection>
          <Name>{sender}</Name>
          <Date></Date>
        </HeaderSection>
      )}
      <Message>{msg}</Message>
    </ChatContainer>
  );
};

const HeaderSection = styled.div``;
const Name = styled.div``;
const Date = styled.div``;
const Message = styled.div``;

const ChatContainer = styled.div<{ mine: boolean }>``;

export default Chat;
