import React, { useState } from "react";
import { styled } from "styled-components";

function AssignmentComponent({ onSelectElde }) {
  // 어르신 정보는 props 또는 API 호출을 통해 가져오는 것으로 가정
  const elders = [
    { id: 1, name: "어르신 A" },
    { id: 2, name: "어르신 B" },
    // 추가 어르신 데이터...
  ];
  const employees = [
    { id: 1, name: "직원 A" },
    { id: 2, name: "직원 B" },
    // 추가 직원 데이터...
  ];
  return (
    <AssignmentComponentSection>
      <div>
        <h2>고정</h2>
        {elders.map((elder) => (
          <div key={elder.id}>
            {elder.name}
            <div style={{ display: "flex" }}>
              <input type="checkbox" />
              <select style={{ marginLeft: "10px" }}>
                <option value="">직원 선택</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </AssignmentComponentSection>
  );
}

const AssignmentComponentSection = styled.section`
  width: 45%;
  height: 400px;
  align-content: center;
  justify-content: center;
  align-items: center;
  display: flex;
  flex-direction: row;
  background: white;
`;

export default AssignmentComponent;
