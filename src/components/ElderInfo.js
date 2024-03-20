import React from "react";

function ElderInfo({ onSelectElder }) {
  // 어르신 정보는 props 또는 API 호출을 통해 가져오는 것으로 가정
  const elders = [
    { id: 1, name: "어르신 A" },
    { id: 2, name: "어르신 B" },
    // 추가 어르신 데이터...
  ];

  return (
    <div>
      <h2>어르신 정보</h2>
      {elders.map((elder) => (
        <div key={elder.id}>
          <input type="checkbox" onChange={() => onSelectElder(elder.id)} />
          {elder.name}
        </div>
      ))}
    </div>
  );
}

export default ElderInfo;
