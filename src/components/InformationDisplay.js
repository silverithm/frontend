import React from "react";
import EmployeeInfo from "./EmployeeInfo";
import ElderInfo from "./ElderInfo.js";
import { styled } from "styled-components";
import { useState } from "react";

function InformationDisplay({
  onSelectEmployee,
  onSelectElder,
  setJwt,
  jwt,
  setEldersInfo,
  setEmployeesInfo,
  userId,
}) {
  const [employeeName, setEmployeeName] = useState("");
  const [employeeWorkPlace, setEmployeeWorkPlace] = useState("");
  const [employeeHomeAddress, setEmployeeHomeAddress] = useState("");
  const [employees, setEmployees] = useState([]);
  const [employeeMaxCapacity, setEmployeeMaxCapacity] = useState(2);

  const [elderlyName, setElderlyName] = useState("");
  const [elderlyHomeAddress, setElderlyHomeAddress] = useState("");
  const [elderlyIsRequiredFrontSeat, setIsElderlyRequiredFrontSeat] =
    useState(true);
  const [selectedRequiredFrontSeat, setSelectedRequiredFrontSeat] = useState();
  const [elders, setElders] = useState([]);

  function addEmployee() {
    console.log("clicked!!!");
    console.log(employeeName);
    console.log(employeeWorkPlace);
    console.log(employeeHomeAddress);
    console.log(employeeMaxCapacity);

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", "Bearer " + jwt);

    const raw = JSON.stringify({
      name: employeeName,
      workPlace: employeeWorkPlace,
      homeAddress: employeeHomeAddress,
      maxCapacity: employeeMaxCapacity,
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch("http://localhost:8080/api/v1/employee/" + userId, requestOptions)
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.error(error));
  }
  function addElderly() {
    console.log("clicked!!!");
    console.log(elderlyName);
    console.log(elderlyHomeAddress);
    console.log(elderlyIsRequiredFrontSeat);

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", "Bearer " + jwt);

    const raw = JSON.stringify({
      name: elderlyName,
      homeAddress: elderlyHomeAddress,
      requiredFrontSeat: elderlyIsRequiredFrontSeat,
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch("http://localhost:8080/api/v1/elder/" + userId, requestOptions)
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.error(error));
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

    await setEmployees(response); // 상태 업데이트
    await setEmployeesInfo(response);
    await console.log(employees);
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

    await setEldersInfo(response);
    await setElders(response); // 상태 업데이트
  };
  return (
    <InformationDisplaySection>
      <div className="employee-info">
        <InformationDiv>
          <h2>
            직원 정보 <button onClick={fetchEmployees}> 불러오기 </button>
          </h2>
        </InformationDiv>

        <EmployeeInfo
          onSelectEmployee={onSelectEmployee}
          setJwt={setJwt}
          jwt={jwt}
          employees={employees}
          userId={userId}
          setEmployees={setEmployees}
          setEmployeesInfo={setEmployeesInfo}
        />

        <InformationDiv2>
          <input
            onChange={(e) => setEmployeeName(e.target.value)}
            placeholder="이름"
          ></input>
          <input
            onChange={(e) => setEmployeeWorkPlace(e.target.value)}
            placeholder="직장 주소"
          ></input>
          <input
            onChange={(e) => setEmployeeHomeAddress(e.target.value)}
            placeholder="집 주소"
          ></input>
          <select
            onChange={(e) => setEmployeeMaxCapacity(e.target.value)}
            placeholder="최대 배치 인원"
          >
            <option value={2}>최대 인원 2</option>
            <option value={3}>최대 인원 3</option>
            <option value={4}>최대 인원 4</option>
            <option value={5}>최대 인원 5</option>
            <option value={6}>최대 인원 6</option>
            <option value={7}>최대 인원 7</option>
            <option value={8}>최대 인원 8</option>
            <option value={9}>최대 인원 9</option>
            <option value={10}>최대 인원 10</option>
          </select>
        </InformationDiv2>

        <button onClick={addEmployee} style={{ width: "100%" }}>
          추가
        </button>
      </div>
      <div className="elder-info">
        <InformationDiv>
          <h2>
            어르신 정보 <button onClick={fetchElders}>불러오기</button>
          </h2>
        </InformationDiv>

        <ElderInfo
          onSelectElder={onSelectElder}
          setJwt={setJwt}
          setEldersInfo={setEldersInfo}
          jwt={jwt}
          userId={userId}
          setElders={setElders}
          elders={elders}
        />

        <InformationDiv2>
          <input
            onChange={(e) => setElderlyName(e.target.value)}
            placeholder="이름"
          ></input>
          <input
            onChange={(e) => setElderlyHomeAddress(e.target.value)}
            placeholder="집 주소"
          ></input>
          <select
            onChange={(e) => setIsElderlyRequiredFrontSeat(e.target.value)}
            placeholder="앞자리 여부"
          >
            <option value={true}>앞자리 필요</option>
            <option value={false}>앞자리 필요없음</option>
          </select>
        </InformationDiv2>

        <button onClick={addElderly} style={{ width: "100%" }}>
          추가
        </button>
      </div>
    </InformationDisplaySection>
  );
}

const InformationDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;
const InformationDiv2 = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
`;
const InformationDisplaySection = styled.section`
  width: 1200px;
  height: 500px;
  align-content: center;
  justify-content: space-around;
  align-items: center;
  display: flex;
  flex-direction: row;
  background: white;
`;

export default InformationDisplay;
