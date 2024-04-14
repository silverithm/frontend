import React, { useState } from "react";
import { styled } from "styled-components";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { toast, ToastContainer } from "react-toastify";

function AssignmentComponent({ jwtSet, jwt, onSelectAssignment, userId }) {
  const [elders, setElders] = useState([]);
  const [employees, setEmployees] = useState([]);

  const handleSelect = (employeeIdx, elderId, elderIdx) => {
    const selectedAssignment = {
      employee_id:
        employeeIdx.target.value === "없음"
          ? "없음"
          : Number(employeeIdx.target.value),
      elderly_id: elderId,
    };

    onSelectAssignment(selectedAssignment);
  };

  const fetchEmployeesAndElders = async () => {
    if (jwt === "") {
      toast(
        "불러오기를 하려면 로그인이 필요합니다. 먼저 로그인을 시도해 주세요."
      );
      return;
    }
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
      "https://silverithm.site/api/v1/employees/" + userId,
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
      "https://silverithm.site/api/v1/elders/" + userId,
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
    <AssignmentDisplaySection>
      <AssignmentInfoSection>
        <h2>
          고정 &nbsp; &nbsp; &nbsp;
          <Button onClick={fetchEmployeesAndElders}>불러오기</Button>
        </h2>
        <ScrollableDiv>
          {elders.map((elder, index) => (
            <ElderRow key={elder.id}>
              <Form.Control
                style={{ textAlign: "center" }}
                value={elder.name}
              ></Form.Control>
              &nbsp;&nbsp;&nbsp;
              <Form.Select
                style={{ textAlign: "center" }}
                onChange={(e) => handleSelect(e, elder.id, index)}
              >
                <option value="없음">없음</option>
                {employees.map((employee, idx) => (
                  <option key={idx} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </Form.Select>
            </ElderRow>
          ))}
        </ScrollableDiv>
        <div style={{ height: "300px" }}></div>
      </AssignmentInfoSection>
    </AssignmentDisplaySection>
  );
}

const ElderRow = styled.div`
  display: flex; /* flex 컨테이너로 만듭니다. */
  justify-content: center; /* 가로 중앙 정렬 */
  align-items: center; /* 세로 중앙 정렬 */
  width: 100%; /* 너비를 부모 컨테이너의 100%로 설정 */
  margin-bottom: 10px; /* 아이템 간 간격 */
`;

const ScrollableDiv = styled.div`
  overflow-y: scroll; // 세로 스크롤 활성화
  height: 400px; // 높이 설정, 원하는 값으로 조정 가능
  width: 400px; // 너비 설정, 필요에 따라 조정 가능
  flex-direction: row;
`;

const AssignmentDisplaySection = styled.section`
  width: 500px;
  height: 500px;
  align-content: center;
  align-items: center;
  display: flex;
  flex-direction: row;
  background: white;
  text-align: center;
`;

const AssignmentInfoSection = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 400px;
  height: 100%;
`;

export default AssignmentComponent;
