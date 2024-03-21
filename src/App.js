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

    // ... 추가적인 처리
  }

  return (
    <Container>
      <Header setJwt={setJwt} jwt={jwt} />
      <Body
        onSelectEmployee={onSelectEmployee}
        onSelectElder={onSelectElder}
        setJwt={setJwt}
        jwt={jwt}
      />
      <Footer />
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

export default App;
