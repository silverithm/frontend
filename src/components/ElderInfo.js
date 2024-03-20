import React from "react";
import { styled } from "styled-components";

function ElderInfo({ onSelectElder, setJwt, jwt }) {
  // 어르신 정보는 props 또는 API 호출을 통해 가져오는 것으로 가정
  const elders = [
    { id: 1, name: "어르신 A" },
    { id: 2, name: "어르신 B" },
    { id: 3, name: "어르신 B" },
    { id: 4, name: "어르신 B" },
    { id: 5, name: "어르신 B" },
    { id: 6, name: "어르신 B" },
    { id: 7, name: "어르신 B" },
    { id: 8, name: "어르신 B" },
    { id: 9, name: "어르신 B" },
    { id: 10, name: "어르신 B" },
    { id: 11, name: "어르신 B" },
    { id: 12, name: "어르신 B" },
    { id: 13, name: "어르신 B" },
  ];

  return (
    <ScrollableDiv>
      <h2>어르신 정보</h2>
      {elders.map((elder) => (
        <div key={elder.id}>
          <input type="checkbox" onChange={() => onSelectElder(elder.id)} />
          {elder.name}
        </div>
      ))}
    </ScrollableDiv>
  );
}

export default ElderInfo;

const ScrollableDiv = styled.div`
  overflow-y: auto; // 세로 스크롤 활성화
  height: 400px; // 높이 설정, 원하는 값으로 조정 가능
  width: 200px; // 너비 설정, 필요에 따라 조정 가능
`;
