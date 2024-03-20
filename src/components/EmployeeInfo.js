import React from "react";

function EmployeeInfo({ onSelectEmployee }) {
  // 직원 정보는 props 또는 API 호출을 통해 가져오는 것으로 가정
  const employees = [
    { id: 1, name: "직원 A" },
    { id: 2, name: "직원 B" },
    // 추가 직원 데이터...
  ];

  return (
    <div>
      <h2>직원 정보</h2>
      {employees.map((employee) => (
        <div key={employee.id}>
          <input
            type="checkbox"
            onChange={() => onSelectEmployee(employee.id)}
          />
          {employee.name}
        </div>
      ))}
    </div>
  );
}

export default EmployeeInfo;
