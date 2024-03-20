import React from "react";
import EmployeeInfo from "./EmployeeInfo";
import ElderInfo from "./ElderInfo.js";
import { styled } from "styled-components";
import { useState } from "react";

function InformationDisplay() {
  return (
    <InformationDisplaySection>
      <div className="employee-info">
        <EmployeeInfo />
      </div>
      <div className="elder-info">
        <ElderInfo />
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
