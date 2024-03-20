import React, { useState } from "react";

function AssignmentComponent() {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedElder, setSelectedElder] = useState(null);

  const handleAssign = () => {
    console.log(
      `Assigning Elder ${selectedElder} to Employee ${selectedEmployee}`
    );
    // 할당 로직 API 호출
  };

  return (
    <div>
      <h2>할당</h2>
      {/* 여기서는 간단히 상태만 변경합니다. 실제로는 EmployeeInfo, ElderInfo 컴포넌트와 연동 필요 */}
      <button onClick={handleAssign}>할당 실행</button>
    </div>
  );
}

export default AssignmentComponent;
