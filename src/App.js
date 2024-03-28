import React from "react";
import Header from "./components/Header";
import Body from "./components/Body";
import Footer from "./components/Footer";
import { styled } from "styled-components";
import { useState } from "react";
import RiseLoader from "react-spinners/RiseLoader";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [jwt, setJwt] = useState("");
  const [selectedElderIds, setSelectedElderIds] = useState([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [fixedAssignments, setFixedAssignments] = useState([]);
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState([]);

  const [employeesInfo, setEmployeesInfo] = useState([]);
  const [eldersInfo, setEldersInfo] = useState([]);

  const [userId, setUserId] = useState();

  let [loading, setLoading] = useState(false);

  const [modalShow, setModalShow] = React.useState(false);

  const [dispatchResult, setDispatchResult] = useState([]);

  function setCompany(companyName, companyAddress) {
    setCompanyName(companyName);
    setCompanyAddress(companyAddress);
  }

  function MyVerticallyCenteredModal(props) {
    return (
      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            차량 배치 결과
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>
            실제 운행 시간은 도로 혼잡도에 따라 10분 정도 차이날 수 있습니다.
          </h4>
          <div>
            {props.data.map((item, index) => (
              <div
                key={index}
                style={{ display: "flex", marginBottom: "10px" }}
              >
                <div style={{ marginRight: "20px", fontWeight: "bold" }}>
                  {item.employeeName}
                </div>
                <div style={{ flexDirection: "row", display: "flex" }}>
                  {item.assignmentElderNames.map((name, idx) => (
                    <div key={idx}> {name} &nbsp;&nbsp;&nbsp;&nbsp; </div>
                  ))}
                  <div>|&nbsp;&nbsp;&nbsp;약 {item.time}분 소요</div>
                </div>
              </div>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={props.onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }

  async function dispatchIn() {
    alert("출근 차량배치가 시작되었습니다.");
    await setLoading(true);

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

    const result = await fetch(
      "http://localhost:8080/api/v1/dispatch",
      requestOptions
    )
      .then((response) => {
        console.log(response.text);
        return response.json();
      })
      .catch((error) => console.error(error));

    await setLoading(false);
    await setDispatchResult(result);
    await console.log(dispatchResult);
    await setModalShow(true);
  }

  async function dispatchOut() {
    alert("퇴근 차량배치가 시작되었습니다.");
    await setLoading(true);

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

    const result = await fetch(
      "http://localhost:8080/api/v1/dispatch",
      requestOptions
    )
      .then((response) => {
        console.log(response.text);
        return response.json();
      })
      .catch((error) => console.error(error));

    await setLoading(false);
    await setDispatchResult(result);
    await console.log(dispatchResult);
    await setModalShow(true);
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
    <div>
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
      {loading && (
        <LoadingOverlay>
          <RiseLoader color="#f88c6b" loading={loading} size={50} />
        </LoadingOverlay>
      )}
      <MyVerticallyCenteredModal
        show={modalShow}
        onHide={() => setModalShow(false)}
        data={dispatchResult}
      />
    </div>
  );
}

const LoadingOverlay = styled.div`
  position: fixed; /* 화면에 고정 */
  top: 0;
  left: 0;
  width: 100%; /* 전체 화면 너비 */
  height: 100%; /* 전체 화면 높이 */
  display: flex;
  justify-content: center; /* 가운데 정렬 */
  align-items: center; /* 세로 방향으로 가운데 정렬 */
  z-index: 1000; /* 다른 요소들 위에 오도록 z-index 설정 */
  flex-direction: column;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

export default App;
