import React from "react";
import Header from "./components/Header";
import Body from "./components/Body";
import Footer from "./components/Footer";
import { styled } from "styled-components";
import { useState } from "react";
import ElderInfo from "./components/ElderInfo";

function App() {
  const [jwt, setJwt] = useState("");
  const [selectedElderIds, setSelectedElderIds] = useState([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [fixedAssignments, setFixedAssignments] = useState([]);
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState([]);

  const [employeesInfo, setEmployeesInfo] = useState([]);
  const [eldersInfo, setEldersInfo] = useState([]);

  function setCompany(companyName, companyAddress) {
    setCompanyName(companyName);
    setCompanyAddress(companyAddress);
    console.log(companyName);
    console.log(companyAddress);
  }

  function dispatch() {
    alert("차량배치가 시작되었습니다.");

    const selectedEmployeesInfos = employeesInfo.filter((employeeInfo) =>
      selectedEmployeeIds.includes(employeeInfo.id)
    );
    const selectedElderlysInfos = eldersInfo.filter((elderlyInfo) =>
      selectedElderIds.includes(elderlyInfo.id)
    );

    const requestJson = {
      elderlys: selectedElderlysInfos,
      employees: selectedEmployeesInfos,
      fixedAssignments: fixedAssignments,
    };

    console.log(requestJson);
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
        jwt={jwt}
        setCompany={setCompany}
        companyName={companyName}
      />
      <Body
        onSelectEmployee={onSelectEmployee}
        onSelectElder={onSelectElder}
        onSelectAssignment={onSelectAssignment}
        setEmployeesInfo={setEmployeesInfo}
        setEldersInfo={setEldersInfo}
        setJwt={setJwt}
        jwt={jwt}
      />
      <Footer dispatch={dispatch} />
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

export default App;
