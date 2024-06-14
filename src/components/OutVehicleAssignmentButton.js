import React from "react";
import Button from "react-bootstrap/Button";

function OutVehicleAssignmentButton({ checkDispatchOutData }) {
  return <Button onClick={checkDispatchOutData}>차량 배치 실행 OUT</Button>;
}

export default OutVehicleAssignmentButton;
