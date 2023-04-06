import styled from "@emotion/styled";
import { IGameHistory } from "../../api/interface";
import Record from "./Record";

const Records = ({ data }: { data: IGameHistory[] }) => {
  return (
    <RecordsContainer>
      {data.map((info, idx) => (
        <Record key={idx} {...info} />
      ))}
    </RecordsContainer>
  );
};

const RecordsContainer = styled.div`
  width: 530px;
  height: 510px;
  background: var(--sub-bg-color);
  border-radius: 20px;
  margin: 0 auto;

  overflow-y: auto;
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

export default Records;
