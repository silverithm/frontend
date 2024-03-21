import React from "react";
import EmployeeInfo from "./EmployeeInfo";
import ElderInfo from "./ElderInfo.js";
import { styled } from "styled-components";

function InformationDisplay({ onSelectEmployee, onSelectElder, setJwt, jwt }) {
  return (
    <InformationDisplaySection>
      <div className="employee-info">
        <EmployeeInfo
          onSelectEmployee={onSelectEmployee}
          setJwt={setJwt}
          jwt={jwt}
        />
      </div>
      <div className="elder-info">
        <ElderInfo onSelectElder={onSelectElder} setJwt={setJwt} jwt={jwt} />
      </div>
    </InformationDisplaySection>
  );
}

const InformationDisplaySection = styled.section`
  width: 45%;
  height: 400px;
  align-content: center;
  justify-content: space-around;
  align-items: center;
  display: flex;
  flex-direction: row;
  background: white;
`;

export default InformationDisplay;
