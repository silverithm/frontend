import React, { useState } from "react";
import { styled } from "styled-components";

function Header({ setJwt, jwt }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignin = async () => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      email: email,
      password: password,
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
      .then((response) => response.json())
      .then((result) => {
        return result;
      })
      .catch((error) => console.error(error));

    await setJwt(loginResult["accessToken"]);
  };

  const handleSignup = () => {
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

    fetch("http://localhost:8080/api/v1/signup", requestOptions)
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.error(error));
  };

  const handleLogout = () => {
    const myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + jwt);

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      redirect: "follow",
    };

    fetch("http://localhost:8080/api/v1/logout", requestOptions)
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.error(error));
  };

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
      </div>

      <div>
        <input
          type="jwt"
          placeholder="Jwt"
          value={jwt}
          onChange={(e) => setJwt(e.target.value)}
          style={{ width: "1400px" }}
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
