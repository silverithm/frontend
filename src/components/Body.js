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
  selectedElderIds,
  selectedEmployeeIds,
}) {
  return (
    <BodyDiv>
      <InformationDisplay
        selectedElderIds={selectedElderIds}
        selectedEmployeeIds={selectedEmployeeIds}
        onSelectEmployee={onSelectEmployee}
        onSelectElder={onSelectElder}
        setEmployeesInfo={setEmployeesInfo}
        setEldersInfo={setEldersInfo}
        setJwt={setJwt}
        jwt={jwt}
        userId={userId}
        onSelectAssignment={onSelectAssignment}
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
  height: 700px;
  align-content: center;
  justify-content: center;
  align-items: center;
  display: flex;
  flex-direction: row;
  border: 2px solid #ccc;
  justify-content: space-around;
  margin: 1px;
`;

export default Body;
