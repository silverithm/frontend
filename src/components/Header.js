import React, { useState } from "react";
import { styled } from "styled-components";

function Header() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [jwtExpiredTime, setJwtExpiredTime] = useState(0);
  const [jwt, setJwt] = useState("");

  const handleLogin = () => {
    // 로그인 처리 로직
  };

  const handleLogout = () => {
    // 로그아웃 처리 로직
  };

  // 회원가입 및 토큰 관련 로직 구현 필요

  return (
    <HeaderDiv>
      <input
        type="text"
        placeholder="ID"
        value={id}
        onChange={(e) => setId(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>로그인</button>
      <button onClick={handleLogout}>로그아웃</button>
      <button onClick={handleLogout}>회원가입</button>
      <input
        type="jwt-expired-time"
        placeholder="JwtExpiredTime"
        value={jwtExpiredTime}
        onChange={(e) => setJwtExpiredTime(e.target.value)}
      />
      <input
        type="jwt"
        placeholder="Jwt"
        value={jwt}
        onChange={(e) => setJwt(e.target.value)}
      />
    </HeaderDiv>
  );
}

const HeaderDiv = styled.div`
  width: 100%;
  height: 100px;
  align-content: center;
  justify-content: center;
  align-items: center;
  display: flex;

  background: papayawhip;
`;

export default Header;
