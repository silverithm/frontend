import React from "react";
import Button from "react-bootstrap/Button";

function OutVehicleAssignmentButton({ dispatchOut }) {
  return <Button onClick={dispatchOut}>차량 배치 실행 OUT</Button>;
}

export default OutVehicleAssignmentButton;
