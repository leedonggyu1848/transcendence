import styled from "@emotion/styled";

const CreateForm = ({
  myName,
  onCreateRoom,
}: {
  myName: string;
  onCreateRoom: React.FormEventHandler<HTMLFormElement>;
}) => {
  return (
    <CreateFormContainer onSubmit={onCreateRoom}>
      <h2>일반 게임</h2>
      <CheckContainer>
        <div>
          <label htmlFor="mode">하드 모드</label>
          <input id="mode" type="checkbox" />
        </div>
        <div>
          <label htmlFor="type">비밀방</label>
          <input id="type" type="checkbox" />
        </div>
      </CheckContainer>
      <InputContainer>
        <label htmlFor="roomName">방 제목</label>
        <input
          type="text"
          id="roomName"
          placeholder={myName + "님의 일반 게임"}
        />
      </InputContainer>
      <InputContainer>
        <label htmlFor="password">비밀번호</label>
        <input type="password" id="password" />
      </InputContainer>
      <CreateButton type="submit">생성하기</CreateButton>
    </CreateFormContainer>
  );
};

const CreateButton = styled.button`
  outline: none;
  border: none;
  background: var(--dark-bg-color);
  color: white;
  width: 80%;
  height: 55px;
  border-radius: 10px;
  font-size: 1.25rem;
  font-weight: bold;
  cursor: pointer;
  letter-spacing: 12px;
  transition: 0.5s;
  &:hover {
    color: var(--gray-color);
  }
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 80%;
  & > label {
    font-size: 1.25rem;
    font-weight: bold;
    margin-bottom: 10px;
  }

  & > input {
    height: 25px;
    padding: 3px 10px;
    outline: none;
    border-radius: 10px;
    border: none;
  }
`;

const CheckContainer = styled.div`
  display: flex;
  width: 80%;
  justify-content: space-between;
  & > div > label {
    margin-right: 5px;
  }
`;

const CreateFormContainer = styled.form`
  width: 100%;
  background: var(--sub-bg-color);
  height: 400px;
  border-radius: 10px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-direction: column;
  & > h2 {
    width: 85%;
  }
`;

export default CreateForm;
