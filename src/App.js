import React from "react";
import Header from "./components/Header";
import Body from "./components/Body";
import Footer from "./components/Footer";
import { styled } from "styled-components";
import { useState } from "react";

function App() {
  const [jwt, setJwt] = useState("");
  const [selectedElderIds, setSelectedElderIds] = useState([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [fixedAssignments, setFixedAssignments] = useState([]);
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState([]);

  const [employeesInfo, setEmployeesInfo] = useState([]);
  const [eldersInfo, setEldersInfo] = useState([]);

  const [dispatchType, setType] = useState("");
  const [userId, setUserId] = useState();

  function setCompany(companyName, companyAddress) {
    setCompanyName(companyName);
    setCompanyAddress(companyAddress);
  }

  function setTypeFunction(type) {
    console.log(type);
    setType(type);
  }

  function dispatchIn() {
    alert("출근 차량배치가 시작되었습니다.");

    const selectedEmployeesInfos = employeesInfo.filter((employeeInfo) =>
      selectedEmployeeIds.includes(employeeInfo.id)
    );
    const selectedElderlysInfos = eldersInfo.filter((elderlyInfo) =>
      selectedElderIds.includes(elderlyInfo.id)
    );

    const requestJson1 = {
      elderlys: selectedElderlysInfos,
      employees: selectedEmployeesInfos,
      company: { companyAddress: companyAddress },
      dispatchType: "IN",
    };
    const requestJson2 = {
      elderlys: selectedElderlysInfos,
      employees: selectedEmployeesInfos,
      company: { companyAddress: companyAddress },
      fixedAssignments: fixedAssignments,
      dispatchType: "IN",
    };

    if (fixedAssignments.length === 0) {
      console.log(JSON.stringify(requestJson1));
    } else {
      console.log(JSON.stringify(requestJson2));
    }

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", "Bearer " + jwt);

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body:
        fixedAssignments.length === 0
          ? JSON.stringify(requestJson1)
          : JSON.stringify(requestJson2),
      redirect: "follow",
    };

    fetch("http://localhost:8080/api/v1/dispatch", requestOptions)
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.error(error));
  }

  function dispatchOut() {
    alert("퇴근 차량배치가 시작되었습니다.");

    const selectedEmployeesInfos = employeesInfo.filter((employeeInfo) =>
      selectedEmployeeIds.includes(employeeInfo.id)
    );
    const selectedElderlysInfos = eldersInfo.filter((elderlyInfo) =>
      selectedElderIds.includes(elderlyInfo.id)
    );

    const requestJson1 = {
      elderlys: selectedElderlysInfos,
      employees: selectedEmployeesInfos,
      company: { companyAddress: companyAddress },
      dispatchType: "OUT",
    };
    const requestJson2 = {
      elderlys: selectedElderlysInfos,
      employees: selectedEmployeesInfos,
      company: { companyAddress: companyAddress },
      fixedAssignments: fixedAssignments,
      dispatchType: "OUT",
    };

    if (fixedAssignments.length === 0) {
      console.log(JSON.stringify(requestJson1));
    } else {
      console.log(JSON.stringify(requestJson2));
    }

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", "Bearer " + jwt);

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body:
        fixedAssignments.length === 0
          ? JSON.stringify(requestJson1)
          : JSON.stringify(requestJson2),
      redirect: "follow",
    };

    fetch("http://localhost:8080/api/v1/dispatch", requestOptions)
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.error(error));
  }

  function onSelectEmployee(employeeId) {
    // 체크박스 선택 여부에 따라 추가 또는 제거
    if (selectedEmployeeIds.includes(employeeId)) {
      setSelectedEmployeeIds(
        selectedEmployeeIds.filter((id) => id !== employeeId)
      );
    } else {
      selectedEmployeeIds.push(employeeId);
      setSelectedEmployeeIds(selectedEmployeeIds);
      console.log(selectedEmployeeIds);
    }
  }

  function onSelectElder(elderId) {
    // 체크박스 선택 여부에 따라 추가 또는 제거
    if (selectedElderIds.includes(elderId)) {
      setSelectedElderIds(selectedElderIds.filter((id) => id !== elderId));
    } else {
      selectedElderIds.push(elderId);
      setSelectedElderIds(selectedElderIds);
      console.log(selectedElderIds);
    }
  }

  function onSelectAssignment(fixedAssignment) {
    // 체크박스 선택 여부에 따라 추가 또는 제거
    if (
      fixedAssignments.includes({
        employee_id: fixedAssignment.employee_idx,
        elder_Id: fixedAssignment.elderly_idx,
      })
    ) {
      setSelectedElderIds(
        fixedAssignments.filter(
          (id) =>
            id.employee_id !== fixedAssignment.employee_idx &&
            id.elder_id !== fixedAssignment.elderly_idx
        )
      );
    } else {
      fixedAssignments.push(fixedAssignment);
      setFixedAssignments(fixedAssignments);
      console.log(fixedAssignments);
    }
  }

  return (
    <Container>
      <Header
        setJwt={setJwt}
        setUserId={setUserId}
        jwt={jwt}
        setCompany={setCompany}
        companyName={companyName}
      />
      <Body
        onSelectEmployee={onSelectEmployee}
        onSelectElder={onSelectElder}
        userId={userId}
        onSelectAssignment={onSelectAssignment}
        setEmployeesInfo={setEmployeesInfo}
        setEldersInfo={setEldersInfo}
        setJwt={setJwt}
        jwt={jwt}
      />
      <Footer dispatchIn={dispatchIn} dispatchOut={dispatchOut} />
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

export default App;
