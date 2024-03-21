import InformationDisplay from "./InformationDisplay";
import AssignmentComponent from "./AssignmentComponent";
import styled from "styled-components";

function Body({ onSelectEmployee, onSelectElder, setJwt, jwt }) {
  return (
    <BodyDiv>
      <InformationDisplay
        onSelectEmployee={onSelectEmployee}
        onSelectElder={onSelectElder}
        setJwt={setJwt}
        jwt={jwt}
      />
      <AssignmentComponent setJwt={setJwt} jwt={jwt} />
    </BodyDiv>
  );
}

const BodyDiv = styled.div`
  width: 100%;
  height: 500px;
  align-content: center;
  justify-content: center;
  align-items: center;
  display: flex;
  flex-direction: row;
  background: papayawhip;
  justify-content: space-around;
`;

export default Body;
