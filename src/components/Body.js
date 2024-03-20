import InformationDisplay from "./InformationDisplay";
import AssignmentComponent from "./AssignmentComponent";
import styled from "styled-components";

function Body() {
  return (
    <BodyDiv>
      <InformationDisplay />
      <AssignmentComponent />
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
  justify-content: space-between;
`;

export default Body;
