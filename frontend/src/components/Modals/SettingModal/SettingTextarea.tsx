import styled from "@emotion/styled";
import { useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  alertModalState,
  myInfoState,
  myIntroduceState,
} from "../../../api/atom";
import { axiosUpdateIntroduce } from "../../../api/request";

const SettingTextArea = () => {
  const [editMode, toggleEdit] = useState(false);
  const [text, setText] = useState("");
  const [myIntroduce, setMyIntroduce] = useRecoilState(myIntroduceState);
  const setAlertModal = useSetRecoilState(alertModalState);
  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.currentTarget.value);
  };
  const msg = "안녕하세요 잘부탁드립니다";

  const handleEditIntroduce = async () => {
    if (!text) return;
    try {
      await axiosUpdateIntroduce(text);
      setMyIntroduce(text);
      //myInfoState 수정 로직 필요
    } catch (e) {
      console.error(e);
      setAlertModal({
        type: "failure",
        header: "자기 소개 변경 실패",
        msg: "자기 소개 변경에 실패했습니다.",
        toggle: true,
      });
    }
  };

  const clickEdit = () => {
    toggleEdit(!editMode);
    if (editMode) {
      handleEditIntroduce();
      setText("");
    }
  };

  return (
    <>
      <Header>
        <Text>자기 소개</Text>
        <Edit editMode={editMode} onClick={clickEdit} />
      </Header>
      {editMode ? (
        <TextArea
          placeholder={myIntroduce || msg}
          value={text}
          onChange={onChange}
        />
      ) : (
        <TextDiv>{myIntroduce || msg}</TextDiv>
      )}
    </>
  );
};

const Edit = styled.div<{ editMode: boolean }>`
  cursor: pointer;
  width: 25px;
  height: 25px;
  background-image: ${({ editMode }) =>
    editMode
      ? 'url("/src/assets/checkIconBackground.png")'
      : 'url("/src/assets/editIcon.png")'};
  background-size: 100% 100%;
`;

const Text = styled.div`
  color: white;
  font-size: 1.25rem;
  margin-top: 20px;
  margin-bottom: 20px;
`;

const Header = styled.div`
  display: flex;
  width: 70%;
  justify-content: space-between;
  align-items: center;
`;

const TextDiv = styled.div`
  width: 65%;
  border: none;
  border-radius: 10px;
  height: 150px;
  background: #333333;
  color: white;
  font-size: 1.25rem;
  padding: 15px;
  overflow-y: auto;
  word-break: break-all;

  &::-webkit-scrollbar {
    border-radius: 10px;
    width: 10px;
  }
  &::-webkit-scrollbar-track {
    background: white;
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--gray-color);
    width: 2px;
    border-radius: 10px;
  }
`;

const TextArea = styled.textarea`
  width: 65%;
  resize: none;
  outline: none;
  border: none;
  background: var(--sub-bg-color);
  border-radius: 10px;
  height: 150px;
  color: white;
  font-size: 1.25rem;
  padding: 15px;
  &::placeholder {
    color: #c5c5c5;
  }
  &::-webkit-scrollbar {
    border-radius: 10px;
    width: 10px;
  }
  &::-webkit-scrollbar-track {
    background: white;
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--gray-color);
    width: 2px;
    border-radius: 10px;
  }
`;

export default SettingTextArea;
