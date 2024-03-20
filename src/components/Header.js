import React, { useState } from "react";
import { styled } from "styled-components";

function Header() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [jwtExpiredTime, setJwtExpiredTime] = useState(0);
  const [jwt, setJwt] = useState("");

  const handleSignin = async () => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      name: name,
      email: email,
      password: password,
      role: "ROLE_ADMIN",
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    const loginResult = await fetch(
      "http://localhost:8080/api/v1/signin",
      requestOptions
    )
      .then((response) => response.text())
      .then((result) => {
        return result;
      })
      .catch((error) => console.error(error));

    await setJwt(loginResult.substring(37, 197));
  };

  const handleSignup = () => {
    // 로그인 처리 로직
  };

  const handleLogout = () => {
    // 로그아웃 처리 로직
  };

  // 회원가입 및 토큰 관련 로직 구현 필요

  return (
    <HeaderDiv>
      <div>
        <input
          type="text"
          placeholder="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="ID"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleSignin}>로그인</button>
        <button onClick={handleLogout}>로그아웃</button>
        <button onClick={handleSignup}>회원가입</button>
        <input
          type="jwt-expired-time"
          placeholder="JwtExpiredTime"
          value={jwtExpiredTime}
          onChange={(e) => setJwtExpiredTime(e.target.value)}
        />
      </div>

      <div>
        <input
          type="jwt"
          placeholder="Jwt"
          value={jwt}
          onChange={(e) => setJwt(e.target.value)}
          style={{ width: "1220px" }}
        />
      </div>
    </HeaderDiv>
  );
}

const HeaderDiv = styled.div`
  width: 100%;
  height: 100px;
  align-content: center;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  display: flex;

  background: papayawhip;
`;

export default Header;
