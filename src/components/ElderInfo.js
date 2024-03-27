import React from "react";
import { styled } from "styled-components";
import { useState } from "react";

function ElderInfo({ onSelectElder, setJwt, setEldersInfo, jwt, userId }) {
  // 어르신 정보는 props 또는 API 호출을 통해 가져오는 것으로 가정

  const [elders, setElders] = useState([]);
  const [selectedRequiredFrontSeat, setSelectedRequiredFrontSeat] = useState();

  const handleSelectChange = (elderId, requiredFrontSeat) => {
    setElders((prevElders) =>
      prevElders.map((elder) =>
        elder.id === elderId
          ? { ...elder, requiredFrontSeat: requiredFrontSeat }
          : elder
      )
    );
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
    <ScrollableDiv>
      <h2>
        어르신 정보 <button onClick={fetchElders}>불러오기</button>
      </h2>
      {elders.map((elder) => (
        <div key={elder.id}>
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
          <button>삭제</button>
        </div>
      ))}
    </ScrollableDiv>
  );
}

export default ElderInfo;

const ScrollableDiv = styled.div`
  overflow-y: auto; // 세로 스크롤 활성화
  height: 400px; // 높이 설정, 원하는 값으로 조정 가능
  width: 400px; // 너비 설정, 필요에 따라 조정 가능
`;
