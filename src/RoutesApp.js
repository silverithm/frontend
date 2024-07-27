import { BrowserRouter, Routes, Route, Router } from "react-router-dom";
import App from "./App";
import Signin from "./signin";
import { ToastContainer } from "react-toastify";

function RoutesApp() {
  return (
    <Routes>
      <Route path="" element={<App />} />
      <Route path="/signin" element={<Signin />} />
    </Routes>
  );
}

export default RoutesApp;
