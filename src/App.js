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
import { toast, ToastContainer } from "react-toastify";
import { EventSourcePolyfill } from "event-source-polyfill";
import ProgressBar from "react-bootstrap/ProgressBar";

import useStore from "./store/useStore";

import config from "./config";

function App() {
  const {
    staticSelectedElderIds,
    staticSelectedEmployeeIds,
    staticElders,
    staticEmployees,
    setStaticSelectedElderIds,
    setStaticSelectedEmployeeIds,
  } = useStore();

  const [jwt, setJwt] = useState("");
  const [selectedElderIds, setSelectedElderIds] = useState([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [fixedAssignments, setFixedAssignments] = useState([]);
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState([]);

  const [employeesInfo, setEmployeesInfo] = useState([]);
  const [eldersInfo, setEldersInfo] = useState([]);

  const [userId, setUserId] = useState();
  const [progress, setProgress] = useState();

  let [loading, setLoading] = useState(false);

  const [modalShow, setModalShow] = React.useState(false);
  const [beforeInModalShow, setBeforeInModalShow] = React.useState(false);
  const [beforeOutModalShow, setBeforeOutModalShow] = React.useState(false);

  const [dispatchData, setDispatchData] = useState([]);
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

  function MyVerticallyCenteredModalDispatchInData(props) {
    function dispatchInStart() {
      props.onHide();
      dispatchIn();
    }

    return (
      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            차량 배치 데이터 확인 (출근)
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>선택하신 데이터가 맞습니까?</h4>
          <div style={{ marginBottom: "20px" }}></div>
          <div style={{ marginBottom: "20px" }}>
            <h5>직원 목록:</h5>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {staticEmployees
                .filter((employee) =>
                  staticSelectedEmployeeIds.includes(employee.id)
                )
                .map((employee) => (
                  <div key={employee.id}>{employee.name}</div>
                ))}
            </div>
          </div>
          <div>
            <h5>어르신 목록:</h5>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {staticElders
                .filter((elder) => staticSelectedElderIds.includes(elder.id))
                .map((elder) => (
                  <div key={elder.id}>{elder.name}</div>
                ))}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={dispatchInStart}>차량 배치 시작하기</Button>
          <Button onClick={props.onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }

  function MyVerticallyCenteredModalDispatchOutData(props) {
    function dispatchOutStart() {
      props.onHide();
      dispatchOut();
    }
    return (
      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            차량 배치 데이터 확인 (퇴근)
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>선택하신 데이터가 맞습니까?</h4>
          <div style={{ marginBottom: "20px" }}></div>
          <div style={{ marginBottom: "20px" }}>
            <h5>직원 목록:</h5>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {staticEmployees
                .filter((employee) =>
                  staticSelectedEmployeeIds.includes(employee.id)
                )
                .map((employee) => (
                  <div key={employee.id}>{employee.name}</div>
                ))}
            </div>
          </div>
          <div>
            <h5>어르신 목록:</h5>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {staticElders
                .filter((elder) => staticSelectedElderIds.includes(elder.id))
                .map((elder) => (
                  <div key={elder.id}>{elder.name}</div>
                ))}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={dispatchOutStart}>차량 배치 시작하기</Button>
          <Button onClick={props.onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }

  async function checkDispatchInData() {
    setBeforeInModalShow(true);
  }

  async function checkDispatchOutData() {
    setBeforeOutModalShow(true);
  }

  async function dispatchIn() {
    console.log(employeesInfo);

    if (jwt === "") {
      toast("차량 배치를 진행하려면 먼저 로그인해 주세요.");
      return;
    }
    getProgressSSE();

    toast("출근 차량배치가 시작되었습니다.");

    await setLoading(true);

    let selectedEmployeesInfos = employeesInfo.filter((employeeInfo) =>
      staticSelectedEmployeeIds.includes(employeeInfo.id)
    );

    // 새로운 배열 생성
    let updatedEmployeesInfos = [];

    selectedEmployeesInfos.forEach((employeeInfo) => {
      // repeat 속성이 없거나 1 이하인 경우, 기본적으로 한 번만 추가
      let repeatCount = employeeInfo.repeat || 1;

      // repeat 횟수 만큼 반복하여 삽입
      for (let i = 0; i < repeatCount; i++) {
        updatedEmployeesInfos.push({ ...employeeInfo, repeat: 1 }); // 스프레드 연산자를 사용해 객체 복사 후, repeat 속성 초기화
      }
    });

    // 원래 배열에 새 배열을 할당
    selectedEmployeesInfos = updatedEmployeesInfos;

    console.log(selectedEmployeesInfos);

    const selectedElderlysInfos = eldersInfo.filter((elderlyInfo) =>
      staticSelectedElderIds.includes(elderlyInfo.id)
    );

    const requestJson1 = {
      elderlys: selectedElderlysInfos,
      employees: selectedEmployeesInfos,
      company: { companyAddress: companyAddress },
      dispatchType: "IN",
      userName: userId,
    };
    const requestJson2 = {
      elderlys: selectedElderlysInfos,
      employees: selectedEmployeesInfos,
      company: { companyAddress: companyAddress },
      fixedAssignments: fixedAssignments,
      dispatchType: "IN",
      userName: userId,
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

    let flag = false;
    const result = await fetch(`${config.apiUrl}/dispatch`, requestOptions)
      .then((response) => {
        if (!response.ok) {
          flag = true;
        }
        console.log(response.text);
        return response.json();
      })
      .catch((error) => console.error(error));

    if (flag) {
      toast("차량 배치에 실패하였습니다. 데이터를 다시 확인해 주세요.");
      setLoading(false);
      return;
    }
    toast("출근 차량배치가 완료되었습니다.");

    await setLoading(false);
    await setDispatchResult(result);
    await console.log(dispatchResult);
    await setModalShow(true);
  }

  function getProgressSSE() {
    const url = `http://localhost:8080/SSE/subscribe/${userId}`;

    const eventSource = new EventSourcePolyfill(url, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    eventSource.addEventListener("sse", (event) => {
      console.log(event);

      if (!event.data.includes("EventStream Created")) {
        setProgress(Number(event.data));
      }
    });
  }

  async function dispatchOut() {
    if (jwt === "") {
      toast("차량 배치를 진행하려면 먼저 로그인해 주세요.");
      return;
    }

    getProgressSSE();

    toast("퇴근 차량배치가 시작되었습니다.");
    await setLoading(true);

    const selectedEmployeesInfos = employeesInfo.filter((employeeInfo) =>
      staticSelectedEmployeeIds.includes(employeeInfo.id)
    );
    const selectedElderlysInfos = eldersInfo.filter((elderlyInfo) =>
      staticSelectedElderIds.includes(elderlyInfo.id)
    );

    const requestJson1 = {
      elderlys: selectedElderlysInfos,
      employees: selectedEmployeesInfos,
      company: { companyAddress: companyAddress },
      dispatchType: "OUT",
      userName: userId,
    };
    const requestJson2 = {
      elderlys: selectedElderlysInfos,
      employees: selectedEmployeesInfos,
      company: { companyAddress: companyAddress },
      fixedAssignments: fixedAssignments,
      dispatchType: "OUT",
      userName: userId,
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

    let flag = false;
    const result = await fetch(`${config.apiUrl}/dispatch`, requestOptions)
      .then((response) => {
        if (!response.ok) {
          flag = true;
        }
        console.log(response);
        return response.json();
      })
      .catch((error) => console.error(error));

    if (flag) {
      toast("차량 배치에 실패하였습니다. 데이터를 다시 확인해 주세요.");
      setLoading(false);
      return;
    }
    toast("퇴근 차량배치가 완료되었습니다.");

    await setLoading(false);
    await setDispatchResult(result);
    await console.log(dispatchResult);
    await setModalShow(true);
  }

  async function onSelectAssignment(fixedAssignment) {
    if (fixedAssignment.elderly_id === "없음") {
      // '없음'을 선택했을 때는 해당 엘더의 모든 할당을 제거

      const filteredAssignments = await fixedAssignments.filter(
        (assignment) =>
          assignment.sequence !== fixedAssignment.sequence ||
          assignment.employee_id !== fixedAssignment.employee_id
      );
      await setFixedAssignments(filteredAssignments);
    } else {
      const filteredAssignments = await fixedAssignments.filter(
        (assignment) =>
          assignment.sequence !== fixedAssignment.sequence ||
          assignment.employee_id !== fixedAssignment.employee_id
      );
      await setFixedAssignments([...filteredAssignments, fixedAssignment]);
    }
  }

  return (
    <div>
      <ToastContainer></ToastContainer>
      <Container>
        <Header
          setJwt={setJwt}
          setUserId={setUserId}
          jwt={jwt}
          setCompany={setCompany}
          companyName={companyName}
          setEldersInfo={setEldersInfo}
          setEmployeesInfo={setEmployeesInfo}
          setSelectedElderIds={setSelectedElderIds}
          setSelectedEmployeeIds={setSelectedEmployeeIds}
        />
        <div style={{ height: "1px" }}></div>
        <Body
          selectedElderIds={selectedElderIds}
          selectedEmployeeIds={selectedEmployeeIds}
          userId={userId}
          onSelectAssignment={onSelectAssignment}
          setEmployeesInfo={setEmployeesInfo}
          setEldersInfo={setEldersInfo}
          setJwt={setJwt}
          jwt={jwt}
        />
        <div style={{ height: "1px" }}></div>
        <Footer
          checkDispatchInData={checkDispatchInData}
          checkDispatchOutData={checkDispatchOutData}
        />
      </Container>
      {loading && (
        <LoadingOverlay>
          <RiseLoader color="#00BFFF" loading={loading} size={50} />
          <div style={{ height: 50 }}></div>
          <ProgressBar
            style={{ width: 1000, height: 50 }}
            animated
            now={progress}
            label={`${progress}%`}
          />
          ;
        </LoadingOverlay>
      )}
      <MyVerticallyCenteredModal
        show={modalShow}
        onHide={() => setModalShow(false)}
        data={dispatchResult}
      />
      <MyVerticallyCenteredModalDispatchInData
        show={beforeInModalShow}
        onHide={() => setBeforeInModalShow(false)}
      />
      <MyVerticallyCenteredModalDispatchOutData
        show={beforeOutModalShow}
        onHide={() => setBeforeOutModalShow(false)}
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
