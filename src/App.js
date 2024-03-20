import React from "react";
import Header from "./components/Header";
import InformationDisplay from "./components/InformationDisplay";
import AssignmentComponent from "./components/AssignmentComponent";
import VehicleAssignmentButton from "./components/VehicleAssignmentButton";
import "./App.css"; // 스타일 시트

function App() {
  return (
    <div className="App">
      <Header />
      <main>
        <InformationDisplay />
        <AssignmentComponent />
      </main>
      <footer>
        <VehicleAssignmentButton />
      </footer>
    </div>
  );
}

export default App;
