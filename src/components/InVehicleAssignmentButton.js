import React from "react";
import Button from "react-bootstrap/Button";

function InVehicleAssignmentButton({ dispatchIn }) {
  return <Button onClick={dispatchIn}>차량 배치 실행 IN</Button>;
}

export default InVehicleAssignmentButton;
