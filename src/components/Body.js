import InformationDisplay from "./InformationDisplay";
import AssignmentComponent from "./AssignmentComponent";
import styled from "styled-components";

function Body({
  onSelectEmployee,
  onSelectElder,
  setJwt,
  jwt,
  onSelectAssignment,
  setEmployeesInfo,
  setEldersInfo,
  userId,
}) {
  return (
    <BodyDiv>
      <InformationDisplay
        onSelectEmployee={onSelectEmployee}
        onSelectElder={onSelectElder}
        setEmployeesInfo={setEmployeesInfo}
        setEldersInfo={setEldersInfo}
        setJwt={setJwt}
        jwt={jwt}
        userId={userId}
      />
      <AssignmentComponent
        setJwt={setJwt}
        jwt={jwt}
        onSelectAssignment={onSelectAssignment}
        userId={userId}
      />
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

  justify-content: space-around;
`;

export default Body;
