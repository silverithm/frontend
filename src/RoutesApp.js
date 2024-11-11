import { BrowserRouter, Routes, Route, Router } from "react-router-dom";
import App from "./App";
import Signin from "./signin";
import Signup from "./components/SignUp";

import React from "react";

function RoutesApp() {
  return (
    <Routes>
      <Route path="" element={<App />} />
      <Route path="/signin" element={<Signin />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  );
}

export default RoutesApp;
