import React from "react";
import Header from "./components/Header";
import Body from "./components/Body";
import Footer from "./components/Footer";
import { styled } from "styled-components";
import { useState } from "react";

function App() {
  const [jwt, setJwt] = useState("");

  return (
    <Container>
      <Header setJwt={setJwt} jwt={jwt} />
      <Body setJwt={setJwt} jwt={jwt} />
      <Footer />
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

export default App;
