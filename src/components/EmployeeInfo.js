import React from "react";
import { styled } from "styled-components";
import { useState } from "react";

function EmployeeInfo({
  onSelectEmployee,
  setJwt,
  jwt,
  setEmployeesInfo,
  userId,
}) {
  const [employees, setEmployees] = useState([]);

  function checkValue() {
    console.log(employees);
  }

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

    await setEmployeesInfo(response);
    await setEmployees(response); // 상태 업데이트
    await console.log(employees);
  };

  const handleMaximumCapacityChange = async (id, value) => {
    await setEmployees((prevEmployees) =>
      prevEmployees.map((employee) =>
        employee.id === id ? { ...employee, maximumCapacity: value } : employee
      )
    );
  };

  return (
    <ScrollableDiv>
      <h2>
        직원 정보 <button onClick={fetchEmployees}> 불러오기 </button>
      </h2>
      {employees.map((employee, index) => (
        <div key={index}>
          <input
            type="checkbox"
            onChange={() => onSelectEmployee(employee.id)}
          />
          <input value={employee["name"]}></input>
          <input
            onChange={(e) => (employee.maximumCapacity = e.target.value)}
            defaultValue={employee["maximumCapacity"]}
          ></input>
          <button>삭제</button>
        </div>
      ))}
    </ScrollableDiv>
  );
}
const ScrollableDiv = styled.div`
  overflow-y: auto; // 세로 스크롤 활성화
  height: 400px; // 높이 설정, 원하는 값으로 조정 가능
  width: 400px; // 너비 설정, 필요에 따라 조정 가능
`;
export default EmployeeInfo;
