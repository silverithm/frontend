import React from "react";
import { styled } from "styled-components";
import { useState } from "react";

function EmployeeInfo({
  onSelectEmployee,
  setJwt,
  jwt,
  userId,
  employees,
  setEmployees,
}) {
  async function deleteEmployee(employeeId) {
    const myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + jwt);

    const requestOptions = {
      method: "DELETE",
      headers: myHeaders,
      redirect: "follow",
    };

    await fetch(
      "http://localhost:8080/api/v1/employee/" + employeeId,
      requestOptions
    )
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.error(error));
    setEmployees((prevEmployees) =>
      prevEmployees.filter((employee) => employee.id !== employeeId)
    );
  }
  return (
    <ScrollableDiv>
      {employees.map((employee, index) => (
        <EmployeeItem key={index}>
          <input
            type="checkbox"
            onChange={() => onSelectEmployee(employee.id)}
          />
          <input value={employee["name"]} readOnly />
          <input
            onChange={(e) => (employee.maximumCapacity = e.target.value)}
            defaultValue={employee["maximumCapacity"]}
          ></input>
          <button onClick={() => deleteEmployee(employee.id)}>삭제</button>
        </EmployeeItem>
      ))}
    </ScrollableDiv>
  );
}
const ScrollableDiv = styled.div`
  overflow-y: scroll; // 세로 스크롤 활성화
  height: 400px; // 높이 설정, 원하는 값으로 조정 가능
  width: 600px; // 너비 설정, 필요에 따라 조정 가능
`;

const EmployeeItem = styled.div`
  display: flex; /* flex 컨테이너로 만듭니다 */
  justify-content: center; /* 내부 요소들을 가로 방향으로 중앙 정렬 */
  align-items: center; /* 세로 방향으로도 중앙 정렬 */
  width: 100%; /* 부모 컨테이너의 너비에 맞춤 */
  margin-bottom: 10px; /* 아래 마진으로 요소들 사이 간격 추가 */
`;
export default EmployeeInfo;
