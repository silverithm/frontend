import React from "react";
import EmployeeInfo from "./EmployeeInfo";
import ElderInfo from "./ElderInfo.js";

function InformationDisplay() {
  return (
    <section id="information-display">
      <div className="employee-info">
        <EmployeeInfo />
      </div>
      <div className="elder-info">
        <ElderInfo />
      </div>
    </section>
  );
}

export default InformationDisplay;
