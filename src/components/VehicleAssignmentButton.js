import React from "react";

function VehicleAssignmentButton() {
  const handleVehicleAssignment = () => {
    // 차량 배치 실행 로직 API 호출
    alert("차량 배치가 실행되었습니다.");
  };

  return <button onClick={handleVehicleAssignment}>차량 배치 실행</button>;
}

export default VehicleAssignmentButton;
