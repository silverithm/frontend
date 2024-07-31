import React from "react";
import { Spinner } from "react-bootstrap";

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.5)", // 반투명 배경
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1050, // 다른 콘텐츠보다 위에 표시
};

const spinnerStyle = {
  width: "3rem",
  height: "3rem",
  borderWidth: "0.3em",
};

const LoadingSpinnerOverlay = () => {
  return (
    <div style={overlayStyle}>
      <Spinner animation="border" variant="primary" style={spinnerStyle} />
    </div>
  );
};

export default LoadingSpinnerOverlay;
