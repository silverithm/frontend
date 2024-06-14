import React from "react";
import Button from "react-bootstrap/Button";

function InVehicleAssignmentButton({ checkDispatchInData }) {
  return <Button onClick={checkDispatchInData}>차량 배치 실행 IN</Button>;
}

export default InVehicleAssignmentButton;
