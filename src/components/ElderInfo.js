import React from "react";
import { styled } from "styled-components";
import { useState } from "react";

function ElderInfo({
  onSelectElder,
  setJwt,
  setEldersInfo,
  jwt,
  userId,
  setElders,
  elders,
}) {
  async function deleteElder(elderId) {
    const myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + jwt);

    const requestOptions = {
      method: "DELETE",
      headers: myHeaders,
      redirect: "follow",
    };

    await fetch("http://localhost:8080/api/v1/elder/" + elderId, requestOptions)
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.error(error));
    setElders((prevElders) =>
      prevElders.filter((elder) => elder.id !== elderId)
    );
  }

  const handleSelectChange = (elderId, requiredFrontSeat) => {
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
          <input type="checkbox" onChange={() => onSelectElder(elder.id)} />
          <input value={elder["name"]}></input>
          <select
            onChange={(e) =>
              handleSelectChange(elder.id, e.target.value === "true")
            }
            value={elder.requiredFrontSeat ? "true" : "false"}
          >
            <option value="true">앞자리 필요</option>
            <option value="false">앞자리 필요없음</option>
          </select>
          <button onClick={() => deleteElder(elder.id)}>삭제</button>
        </ElderItem>
      ))}
    </ScrollableDiv>
  );
}

export default ElderInfo;

const ScrollableDiv = styled.div`
  overflow-y: scroll; // 세로 스크롤 활성화
  height: 400px; // 높이 설정, 원하는 값으로 조정 가능
  width: 600px; // 너비 설정, 필요에 따라 조정 가능
`;
const ElderItem = styled.div`
  display: flex; /* flex 컨테이너로 만듭니다. */
  justify-content: center; /* 가로 중앙 정렬 */
  align-items: center; /* 세로 중앙 정렬 */
  width: 100%; /* 너비를 부모 컨테이너의 100%로 설정 */
  margin-bottom: 10px; /* 아이템 간 간격 */
`;
