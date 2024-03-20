import React from "react";
import { styled } from "styled-components";

function EmployeeInfo({ onSelectEmployee }) {
  // 직원 정보는 props 또는 API 호출을 통해 가져오는 것으로 가정
  const employees = [
    { id: 1, name: "직원 A" },
    { id: 2, name: "직원 B" },
    { id: 3, name: "직원 B" },
    { id: 4, name: "직원 B" },
    { id: 5, name: "직원 B" },
    { id: 6, name: "직원 B" },
    { id: 7, name: "직원 B" },
    { id: 8, name: "직원 B" },
    { id: 9, name: "직원 B" },
    { id: 10, name: "직원 B" },
    { id: 11, name: "직원 B" },
    { id: 12, name: "직원 B" },
    { id: 13, name: "직원 B" },
    { id: 14, name: "직원 B" },
    { id: 15, name: "직원 B" },
  ];

  return (
    <ScrollableDiv>
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
    </ScrollableDiv>
  );
}
const ScrollableDiv = styled.div`
  overflow-y: auto; // 세로 스크롤 활성화
  height: 400px; // 높이 설정, 원하는 값으로 조정 가능
  width: 200px; // 너비 설정, 필요에 따라 조정 가능
`;
export default EmployeeInfo;
