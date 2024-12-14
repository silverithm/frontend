import { BrowserRouter, Routes, Route, Router } from "react-router-dom";
import App from "./App";
import Signin from "./signin";
import Signup from "./components/SignUp";
import MyProfile from "./components/MyProfile";
import LandingPage from "./components/LandingPage";

import React from "react";
import HelpPage from "./components/HelpPage";
import PaymentSuccess from "./components/PaymentSuccess";
import PaymentFail from "./components/PaymentFail";

function RoutesApp() {
  return (
    <Routes>
      <Route path="" element={<LandingPage />} />
      <Route path="/main" element={<App />} />
      <Route path="/help" element={<HelpPage />} />
      <Route path="/signin" element={<Signin />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/my-profile" element={<MyProfile />} />
      <Route path="/success" element={<PaymentSuccess />} />
      <Route path="/fail" element={<PaymentFail />} />
    </Routes>
  );
}

export default RoutesApp;
