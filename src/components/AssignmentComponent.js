import React, { useState } from "react";
import { styled } from "styled-components";

function AssignmentComponent({ onSelectElde }) {
  // 어르신 정보는 props 또는 API 호출을 통해 가져오는 것으로 가정
  const elders = [
    { id: 1, name: "어르신 A" },
    { id: 2, name: "어르신 B" },
    { id: 3, name: "어르신 B" },
    { id: 4, name: "어르신 B" },
    { id: 5, name: "어르신 B" },
    { id: 6, name: "어르신 B" },
    { id: 7, name: "어르신 B" },
    { id: 8, name: "어르신 B" },
    { id: 9, name: "어르신 B" },
    { id: 10, name: "어르신 B" },
    { id: 11, name: "어르신 B" },
    { id: 12, name: "어르신 B" },
    { id: 13, name: "어르신 B" },
  ];
  const employees = [
    { id: 1, name: "직원 A" },
    { id: 2, name: "직원 B" },
    // 추가 직원 데이터...
  ];
  return (
    <AssignmentComponentSection>
      <ScrollableDiv>
        <h2>고정</h2>
        {elders.map((elder) => (
          <div key={elder.id}>
            {elder.name}
            <div style={{ display: "flex" }}>
              <select style={{ marginLeft: "10px" }}>
                <option value="">없음</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </ScrollableDiv>
    </AssignmentComponentSection>
  );
}

const ScrollableDiv = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  overflow-y: auto; // 세로 스크롤 활성화
  height: 100%; // 높이 설정, 원하는 값으로 조정 가능
  width: 100%; // 너비 설정, 필요에 따라 조정 가능
`;
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
