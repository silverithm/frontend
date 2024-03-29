import React, { useState } from "react";
import { styled } from "styled-components";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
function Header({
  setJwt,
  jwt,
  setCompany,
  companyName,
  setUserId,
  setEldersInfo,
  setEmployeesInfo,
  setSelectedElderIds,
  setSelectedEmployeeIds,
}) {
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
      "http://ec2-3-35-4-92.ap-northeast-2.compute.amazonaws.com:8080/api/v1/signin",
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        return result;
      })
      .catch((error) => {
        console.error(error);
      });

    try {
      await setJwt(loginResult["tokenInfo"]["accessToken"]);
      await setCompany(
        loginResult["companyName"],
        loginResult["companyAddress"]
      );
      await setUserId(loginResult["userId"]);
      await toast("로그인에 성공하였습니다.");
    } catch (error) {
      toast("로그인에 실패하였습니다. 다시 시도해 주세요.");
    }
  };

  const handleSignup = () => {
    toast(
      "해당 기능은 준비 중입니다. 회원가입을 원하시면 관리자에게 문의해 주세요."
    );

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

    fetch(
      "http://ec2-3-35-4-92.ap-northeast-2.compute.amazonaws.com:8080/api/v1/signup",
      requestOptions
    )
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => alert("회원가입에 실패하였습니다."));
  };

  const handleLogout = async () => {
    if (jwt === "") {
      toast("로그인 상태가 아닙니다. 로그인 후 이용해 주세요.");
      return;
    }

    const myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + jwt);

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      redirect: "follow",
    };

    await fetch(
      "http://ec2-3-35-4-92.ap-northeast-2.compute.amazonaws.com:8080/api/v1/logout",
      requestOptions
    )
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => alert("로그아웃에 실패하였습니다."));
    await window.location.reload();

    await toast("로그아웃에 성공하였습니다. 다시 로그인해 주세요");
  };

  return (
    <HeaderDiv>
      <InputDiv>
        <Form.Control
          type="text"
          placeholder="Id"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Form.Control
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button style={{ width: "300px" }} onClick={handleSignin}>
          로그인
        </Button>
        <Button style={{ width: "300px" }} onClick={handleLogout}>
          로그아웃
        </Button>
        <Button style={{ width: "300px" }} onClick={handleSignup}>
          회원가입
        </Button>
      </InputDiv>

      <div>
        <Form.Control
          readOnly
          type="jwt"
          placeholder="Jwt"
          value={jwt}
          onChange={(e) => setJwt(e.target.value)}
          style={{ width: "1400px", textAlign: "center" }}
        />
      </div>
      <div>
        <Form.Control
          readOnly
          type="companyName"
          placeholder="companyName"
          value={companyName}
          style={{ width: "1400px", textAlign: "center" }}
        />
      </div>
    </HeaderDiv>
  );
}

const HeaderDiv = styled.div`
  width: 100%;
  height: 150px;
  align-content: center;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  display: flex;
  border: 2px solid #ccc;
  margin: 1px;
`;

const InputDiv = styled.div`
  width: 700px;
  display: flex;
  flex-direction: row;
`;

export default Header;
