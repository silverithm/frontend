import React from "react";
import EmployeeInfo from "./EmployeeInfo";
import ElderInfo from "./ElderInfo";

function InformationDisplay() {
  return (
    <section>
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
