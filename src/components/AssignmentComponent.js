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
      <AssignmentDiv>
        <h2>
          고정 <button onClick={fetchEmployeesAndElders}>불러오기</button>
        </h2>
        <ScrollableDiv>
          {elders.map((elder) => (
            <ElderRow key={elder.id}>
              <input value={elder.name}></input>
              <select onChange={(e) => handleSelect(e, elder.id)}>
                <option value="없음">없음</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </ElderRow>
          ))}
        </ScrollableDiv>
      </AssignmentDiv>
    </AssignmentComponentSection>
  );
}

const AssignmentDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const ElderRow = styled.div`
  display: flex;
  flex-direction: row; // 수평 정렬
  align-items: center; // 세로 중앙 정렬
  justify-content: center; // 시작 부분부터 요소를 배열
`;

const ScrollableDiv = styled.div`
  overflow-y: scroll; // 세로 스크롤 활성화
  height: 470px; // 높이 설정, 원하는 값으로 조정 가능
  width: 450px; // 너비 설정, 필요에 따라 조정 가능
  flex-direction: row;
`;

const AssignmentComponentSection = styled.section`
  height: 470px;
  width: 500px;

  align-content: center;
  align-items: center;
  display: flex;
  flex-direction: row;
  background: white;
  text-align: center;
`;

export default AssignmentComponent;
