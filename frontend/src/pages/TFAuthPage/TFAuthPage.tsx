import styled from "@emotion/styled";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { alertModalState } from "../../api/atom";
import { axiosPostAuthCode } from "../../api/request";
import Counter from "./Counter";

const TFAuthPage = () => {
  const [timeOver, setTimeOver] = useState(false);
  const [email, setEmail] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const input1 = useRef<HTMLInputElement>(null);
  const input2 = useRef<HTMLInputElement>(null);
  const input3 = useRef<HTMLInputElement>(null);
  const input4 = useRef<HTMLInputElement>(null);
  const input5 = useRef<HTMLInputElement>(null);
  const input6 = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  const onChange = async (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    const inputs = [input1, input2, input3, input4, input5, input6];
    const regex = /^(?:[A-Za-z]+|\d+)$/;
    const nextInput = inputs[index + 1];

    if (value.length === 1 && !regex.test(value)) e.target.value = "";

    if (index === 5 && value.length === 1) {
      const code = inputs.reduce((a, c: any) => a + c.current.value, "");
      try {
        const response = await axiosPostAuthCode(code);
        if (response) {
          navigate("/main/lobby");
        } else {
          setError("인증 코드가 맞지 않습니다");
        }
      } catch (e) {
        navigate("/");
      }
    }
    if (value.length === 1 && nextInput) {
      nextInput.current?.focus();
    }
  };

  const onPaste = async (
    index: number,
    e: React.ClipboardEvent<HTMLInputElement>
  ) => {
    const pastedText = e.clipboardData.getData("text");
    const inputs = [input1, input2, input3, input4, input5, input6].filter(
      (input) => input.current != null
    );
    for (let i = index, j = 0; i < 6; i++, j++) {
      if (inputs[i].current) inputs[i].current.value = pastedText[j];
    }
    const code = inputs.reduce((a, c: any) => a + c.current.value, "");
    try {
      const response = await axiosPostAuthCode(code);
      if (response) {
        navigate("/main/lobby");
      } else {
        setError("인증 코드가 맞지 않습니다");
      }
    } catch (e) {
      navigate("/");
    }
  };

  useEffect(() => {
    setEmail(location.search.split("=")[1]);
    navigate(window.location.pathname);
    if (input1.current) {
      input1.current.focus();
    }
    if (timeOver) {
      navigate("/");
    }
  }, [timeOver]);

  return (
    <TFAuthPageContainer>
      <h1>2차 인증</h1>
      <Email>{email}</Email>
      <Counter setTimeOver={setTimeOver} />
      <CodeContainer>
        {[input1, input2, input3].map((input, index) => (
          <Input
            onPaste={(e) => onPaste(index, e)}
            key={index}
            onChange={(e) => onChange(index, e)}
            ref={input}
            type="text"
            maxLength={1}
          />
        ))}
        <Dash>-</Dash>
        {[input4, input5, input6].map((input, index) => (
          <Input
            key={index}
            onChange={(e) => onChange(index + 3, e)}
            ref={input}
            type="text"
            maxLength={1}
          />
        ))}
      </CodeContainer>
      <Msg>{error}</Msg>
    </TFAuthPageContainer>
  );
};

const Msg = styled.div`
  width: 80%;
  height: 30px;
  margin-top: 25px;
  text-align: center;
  color: #f84d4d;
  font-size: 1.25rem;
`;

const Dash = styled.div`
  font-size: 2rem;
`;

const Input = styled.input`
  width: 50px;
  height: 100%;
  margin: 3px;
  outline_none;
  border:none;
  border-radius:5px;
  background:#a6a6a6;
  display:flex;
  justify-content:center;
  align-items:center;
  text-align:center;
  font-size:2rem;
  &:focus {
    outline:none;
  }
  color:white;
`;

const CodeContainer = styled.div`
  width: 75%;
  height: 80px;
  margin-top: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Email = styled.div`
  font-size: 1.8rem;
  background: var(--dark-bg-color);
  border-radius: 10px;
  padding: 20px 35px;
  margin-top: 10px;
`;

const TFAuthPageContainer = styled.div`
  width: 500px;
  height: 600px;
  background: var(--main-bg-color);
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  color: white;
  & > h1 {
    font-size: 2.5rem;
    letter-spacing: 5px;
  }
`;

export default TFAuthPage;
