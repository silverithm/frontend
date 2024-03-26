import React, { useState } from "react";
import { styled } from "styled-components";

function AssignmentComponent({ jwtSet, jwt, onSelectAssignment, userId }) {
  const [elders, setElders] = useState([]);
  const [employees, setEmployees] = useState([]);

  const handleSelect = (e, elderId) => {
    const selectedAssignment = {
      employee_idx: Number(e.target.value),
      elderly_idx: elderId,
    };

    onSelectAssignment(selectedAssignment);
  };

  const fetchEmployeesAndElders = async () => {
    await fetchEmployees();
    await fetchElders();
  };

  const fetchEmployees = async () => {
    const myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + jwt);

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };
    const response = await fetch(
      "http://localhost:8080/api/v1/employees/" + userId,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        return result;
      })
      .catch((error) => console.error(error));

    await setEmployees(response); // 상태 업데이트
  };
  const fetchElders = async () => {
    const myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + jwt);

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };
    const response = await fetch(
      "http://localhost:8080/api/v1/elders/" + userId,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        return result;
      })
      .catch((error) => console.error(error));

    await setElders(response); // 상태 업데이트
  };
  return (
    <AssignmentComponentSection>
      <ScrollableDiv>
        <h2>
          고정 <button onClick={fetchEmployeesAndElders}>불러오기</button>
        </h2>
        {elders.map((elder) => (
          <div key={elder.id}>
            {elder.name}
            <div style={{ display: "flex" }}>
              <select
                onChange={(e) => handleSelect(e, elder.id)}
                style={{ marginLeft: "10px" }}
              >
                <option value="없음">없음</option>
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
