import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.css";
import * as Sentry from "@sentry/react";

import reportWebVitals from "./reportWebVitals";
import { BrowserRouter, Routes, Route, Router } from "react-router-dom";

import RoutesApp from "./RoutesApp";

Sentry.init({
  dsn: "https://072d0e3c7b64a25a408bfa4296976dc2@o4508382052220928.ingest.us.sentry.io/4508382082564096",
  integrations: [],
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <div>
    <BrowserRouter>
      <RoutesApp></RoutesApp>
    </BrowserRouter>
  </div>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
