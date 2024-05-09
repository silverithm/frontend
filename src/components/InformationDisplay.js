import React from "react";
import EmployeeInfo from "./EmployeeInfo";
import ElderInfo from "./ElderInfo.js";
import { styled } from "styled-components";
import { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { toast, ToastContainer } from "react-toastify";
function InformationDisplay({
  onSelectEmployee,
  onSelectElder,
  setJwt,
  jwt,
  setEldersInfo,
  setEmployeesInfo,
  userId,
  onSelectAssignment,
  onSelectDriver,
}) {
  const [employeeName, setEmployeeName] = useState("");
  const [employeeWorkPlace, setEmployeeWorkPlace] = useState("");
  const [employeeHomeAddress, setEmployeeHomeAddress] = useState("");
  const [employees, setEmployees] = useState([]);
  const [employeeMaxCapacity, setEmployeeMaxCapacity] = useState(2);

  const [employeeIsDriver, setEmployeeIsDriver] = useState(false);

  const [elderlyName, setElderlyName] = useState("");
  const [elderlyHomeAddress, setElderlyHomeAddress] = useState("");
  const [elderlyIsRequiredFrontSeat, setIsElderlyRequiredFrontSeat] =
    useState(true);
  const [selectedRequiredFrontSeat, setSelectedRequiredFrontSeat] = useState();
  const [elders, setElders] = useState([]);

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

  function addEmployee() {
    if (jwt === "") {
      toast("추가를 하려면 로그인이 필요합니다. 먼저 로그인을 시도해 주세요.");
      return;
    }

    if (
      employeeName === "" ||
      employeeWorkPlace === "" ||
      employeeHomeAddress === ""
    ) {
      toast("직원 정보를 모두 입력해 주세요.");
      return;
    }
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
      isDriver: employeeIsDriver,
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch("https://silverithm.site/api/v1/employee/" + userId, requestOptions)
      .then((result) => {
        if (!result.ok) {
          toast("직원 추가에 실패하였습니다. 주소를 다시 확인해 주세요.");
        } else {
          toast("직원 추가에 성공하였습니다.");
        }
      })
      .then((result) => console.log(result))
      .catch((error) => console.log(error));
  }

  function addElderly() {
    if (jwt === "") {
      toast("추가를 하려면 로그인이 필요합니다. 먼저 로그인을 시도해 주세요.");
      return;
    }
    if (
      elderlyName === "" ||
      elderlyHomeAddress === "" ||
      elderlyIsRequiredFrontSeat === ""
    ) {
      toast("어르신 정보를 모두 입력해 주세요.");
      return;
    }
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

    fetch("https://silverithm.site/api/v1/elder/" + userId, requestOptions)
      .then((response) => {
        if (!response.ok) {
          toast("직원 추가에 실패하였습니다. 주소를 다시 확인해 주세요.");
        } else {
          toast("직원 추가에 성공하였습니다.");
        }
      })
      .then((result) => console.log(result))
      .catch((error) => console.error(error));
  }

  const fetchEmployees = async () => {
    if (jwt === "") {
      toast(
        "불러오기를 하려면 로그인이 필요합니다. 먼저 로그인을 시도해 주세요."
      );
      return;
    }
    const myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + jwt);

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };
    const response = await fetch(
      "https://silverithm.site/api/v1/employees/" + userId,
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
    if (jwt === "") {
      toast(
        "불러오기를 하려면 로그인이 필요합니다. 먼저 로그인을 시도해 주세요."
      );
      return;
    }
    const myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + jwt);

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };
    const response = await fetch(
      "https://silverithm.site/api/v1/elders/" + userId,
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
      <EmployeeInfoSection>
        <InformationDiv>
          <h2>
            직원 정보 &nbsp; &nbsp; &nbsp;
            <Button onClick={fetchEmployees}> 불러오기 </Button>
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

        <Form.Control
          style={{ width: "400px", textAlign: "center" }}
          onChange={(e) => setEmployeeName(e.target.value)}
          placeholder="이름"
        ></Form.Control>
        <Form.Control
          style={{ width: "400px", textAlign: "center" }}
          onChange={(e) => setEmployeeWorkPlace(e.target.value)}
          placeholder="직장 주소"
        ></Form.Control>
        <Form.Control
          style={{ width: "400px", textAlign: "center" }}
          onChange={(e) => setEmployeeHomeAddress(e.target.value)}
          placeholder="집 주소"
        ></Form.Control>
        <Form.Select
          style={{ textAlign: "center" }}
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
        </Form.Select>

        <Form.Select
          style={{ textAlign: "center" }}
          onChange={(e) => setEmployeeIsDriver(e.target.value)}
          placeholder="최대 배치 인원"
        >
          <option value={false}>직원</option>
          <option value={true}>운전원</option>
        </Form.Select>

        <Button onClick={addEmployee} style={{ width: "100%" }}>
          추가
        </Button>
      </EmployeeInfoSection>
      <ElderInfoSection>
        <InformationDiv>
          <h2>
            어르신 정보 &nbsp; &nbsp; &nbsp;{" "}
            <Button onClick={fetchElders}>불러오기</Button>
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

        <Form.Control
          style={{ width: "400px", textAlign: "center" }}
          onChange={(e) => setElderlyName(e.target.value)}
          placeholder="이름"
        ></Form.Control>
        <Form.Control
          style={{ width: "400px", textAlign: "center" }}
          onChange={(e) => setElderlyHomeAddress(e.target.value)}
          placeholder="집 주소"
        ></Form.Control>
        <Form.Select
          style={{ textAlign: "center" }}
          onChange={(e) => setIsElderlyRequiredFrontSeat(e.target.value)}
          placeholder="앞자리 여부"
        >
          <option value={true}>앞자리 필요</option>
          <option value={false}>앞자리 필요없음</option>
        </Form.Select>

        <Button onClick={addElderly} style={{ width: "100%" }}>
          추가
        </Button>
      </ElderInfoSection>
    </InformationDisplaySection>
  );
}

const ElderInfoSection = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 400px;
  height: 100%;
`;

const EmployeeInfoSection = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 400px;
  height: 100%;
`;

const InformationDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const InformationDisplaySection = styled.section`
  width: 1100px;
  height: 500px;
  align-content: center;
  justify-content: space-around;
  align-items: center;
  display: flex;
  flex-direction: row;
  background: white;
`;

export default InformationDisplay;
