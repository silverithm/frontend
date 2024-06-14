import React from "react";
import { styled } from "styled-components";
import { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { toast, ToastContainer } from "react-toastify";
import config from "../config";
import useStore from "../store/useStore";

function ElderInfo({
  onSelectElder,
  setJwt,
  setEldersInfo,
  jwt,
  userId,
  setElders,
  elders,
}) {
  const { staticSelectedElderIds, setStaticSelectedElderIds } = useStore();
  const handleSelectElder = (id) => {
    if (staticSelectedElderIds.includes(id)) {
      setStaticSelectedElderIds(
        staticSelectedElderIds.filter((elderId) => elderId !== id)
      );
    } else {
      setStaticSelectedElderIds([...staticSelectedElderIds, id]);
    }
    console.log(staticSelectedElderIds);
  };

  async function deleteElder(elderId) {
    const myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + jwt);

    const requestOptions = {
      method: "DELETE",
      headers: myHeaders,
      redirect: "follow",
    };

    await fetch(`${config.apiUrl}/elder/` + elderId, requestOptions)
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.error(error));
    setElders((prevElders) =>
      prevElders.filter((elder) => elder.id !== elderId)
    );

    await toast("삭제에 성공하였습니다.");
  }

  const handleSelectChange = (elderId, elderName, requiredFrontSeat) => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", "Bearer " + jwt);

    const raw = JSON.stringify({
      requiredFrontSeat: requiredFrontSeat,
    });

    const requestOptions = {
      method: "PUT",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch(`${config.apiUrl}/elder/frontseat/` + elderId, requestOptions)
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.error(error));

    setElders((prevElders) =>
      prevElders.map((elder) =>
        elder.id === elderId
          ? { ...elder, requiredFrontSeat: requiredFrontSeat }
          : elder
      )
    );
  };

  return (
    <ScrollableDiv>
      {elders.map((elder) => (
        <ElderItem key={elder.id}>
          <Form.Check
            defaultChecked={true}
            onChange={() => handleSelectElder(elder.id)}
          />
          &nbsp;&nbsp;&nbsp;
          <Form.Control
            style={{ width: "160px", textAlign: "center" }}
            value={elder["name"]}
          ></Form.Control>
          &nbsp;&nbsp;&nbsp;
          <Form.Select
            style={{ width: "150px", textAlign: "center" }}
            onChange={(e) =>
              handleSelectChange(
                elder.id,
                elder.name,
                e.target.value === "true"
              )
            }
            value={elder.requiredFrontSeat ? "true" : "false"}
          >
            <option value="true">앞자리 필요</option>
            <option value="false">앞자리 필요없음</option>
          </Form.Select>
          &nbsp;&nbsp;&nbsp;
          <Button onClick={() => deleteElder(elder.id)}>삭제</Button>
        </ElderItem>
      ))}
    </ScrollableDiv>
  );
}

export default ElderInfo;

const ScrollableDiv = styled.div`
  overflow-y: scroll; // 세로 스크롤 활성화
  height: 400px; // 높이 설정, 원하는 값으로 조정 가능
  width: 500px; // 너비 설정, 필요에 따라 조정 가능
`;
const ElderItem = styled.div`
  display: flex; /* flex 컨테이너로 만듭니다. */
  justify-content: center; /* 가로 중앙 정렬 */
  align-items: center; /* 세로 중앙 정렬 */
  width: 100%; /* 너비를 부모 컨테이너의 100%로 설정 */
  margin-bottom: 10px; /* 아이템 간 간격 */
`;
