import { useEffect, useState } from "react";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { toast, ToastContainer } from "react-toastify";
import config from "./config";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import useStore from "./store/useStore";
import Modal from "react-bootstrap/Modal";
import React from "react";
import { EventSourcePolyfill } from "event-source-polyfill";
import { styled } from "styled-components";
import ProgressBar from "react-bootstrap/ProgressBar";
import ScaleLoader from "react-spinners/ScaleLoader";
import { Form } from "react-bootstrap";
import { Button } from "react-bootstrap";

import "./styles/bootstrapcss.css";

import LoadingSpinnerOverlay from "./components/LoadingSpinner";

const { kakao } = window;

function App() {
  const [view, setView] = useState("current"); // 'current' or 'previous'
  const [isEmployeeCollapsed, setIsEmployeeCollapsed] = useState(true);
  const [isElderCollapsed, setIsElderCollapsed] = useState(true);
  const [isFixCollapsed, setIsFixCollapsed] = useState(true);
  const [maxDisaptchStatus, setMaxDispatchStatus] = useState("under");
  const [fixedAssignments, setFixedAssignments] = useState([]);

  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [editingElderId, setEditingElderId] = useState(null);
  const [editedEmployee, setEditedEmployee] = useState({});
  const [editedElder, setEditedElder] = useState({});

  const [elders, setElders] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [allEmployeeSelected, setAllEmployeeSelected] = useState(true);
  const [allElderSelected, setAllElderSelected] = useState(true);

  const [fixedCount, setFixedCount] = useState(0);

  const [modalShow, setModalShow] = React.useState(false);
  const [beforeInModalShow, setBeforeInModalShow] = React.useState(false);
  const [beforeOutModalShow, setBeforeOutModalShow] = React.useState(false);

  const [dispatchResult, setDispatchResult] = useState([]);
  const [loading, setLoading] = useState(false);

  const [progress, setProgress] = useState();

  const [selections, setSelections] = useState({});

  const [LoadingSpinner, setLoadingSpinner] = useState(false);

  const [colors, setColors] = useState([]);
  var randomColors = [];

  const navigate = useNavigate();

  const {
    setIsSignin,
    setJwt,
    setUserId,
    setUserEmail,
    setCompany,
    setSelectedElderIds,
    setSelectedEmployeeIds,
  } = useStore();

  const {
    isSignin,
    company,
    jwt,
    userId,
    userEmail,
    selectedElderIds,
    selectedEmployeeIds,
  } = useStore();

  const updateEmployee = async (id, data) => {
    setLoadingSpinner(true);

    const updateData = {
      name: data.name,
      workPlace: data.workPlaceName,
      homeAddress: data.homeAddressName,
      maxCapacity: data.maximumCapacity,
    };

    console.log(updateData);

    const response = await fetch(`${config.apiUrl}/employee/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Something went wrong");
    }
    await toast("직원 수정에 성공하였습니다.");
    await setLoadingSpinner(false);

    return response;
  };

  const updateElder = async (id, data) => {
    setLoadingSpinner(true);
    const updateData = {
      name: data.name,
      homeAddress: data.homeAddressName,
      requiredFrontSeat: data.requiredFrontSeat,
    };

    console.log(updateData);

    const response = await fetch(`${config.apiUrl}/elder/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Something went wrong");
    }

    await toast("어르신 수정에 성공하였습니다.");
    await setLoadingSpinner(false);

    return response;
  };

  const handleEmployeeEdit = async (id) => {
    setLoadingSpinner(true);
    if (editingEmployeeId === id) {
      try {
        const response = await updateEmployee(id, editedEmployee);
        if (response.ok) {
          // 수정 완료
          setEmployees(
            employees.map((emp) =>
              emp.id === id ? { ...emp, ...editedEmployee } : emp
            )
          );
          setEditingEmployeeId(null);
          setEditedEmployee({});
        } else {
          throw new Error("Server responded with an error");
        }
      } catch (error) {
        console.error("Error updating employee:", error);
      }
    } else {
      // 수정 시작
      setEditingEmployeeId(id);
      setEditedEmployee(employees.find((emp) => emp.id === id));
    }
    await setLoadingSpinner(false);
  };

  const handleElderEdit = async (id) => {
    setLoadingSpinner(true);
    if (editingElderId === id) {
      // 수정 완료
      try {
        const response = await updateElder(id, editedElder);
        if (response.ok) {
          setElders(
            elders.map((elder) =>
              elder.id === id ? { ...elder, ...editedElder } : elder
            )
          );
          setEditingElderId(null);
          setEditedElder({});
        } else {
          throw new Error("Server responded with an error");
        }
      } catch (error) {
        console.error("Error updating elder:", error);
      }
    } else {
      // 수정 시작
      setEditingElderId(id);
      setEditedElder(elders.find((elder) => elder.id === id));
    }
    await setLoadingSpinner(false);
  };

  const handleEmployeeInputChange = async (e, field) => {
    await setLoadingSpinner(true);
    setEditedEmployee({ ...editedEmployee, [field]: e.target.value });
    await setLoadingSpinner(false);
  };

  const handleElderInputChange = async (e, field) => {
    await setLoadingSpinner(true);
    setEditedElder({ ...editedElder, [field]: e.target.value });
    await setLoadingSpinner(false);
  };

  const handleSelectChange = async (e, field) => {
    await setLoadingSpinner(true);
    setEditedElder({ ...editedElder, [field]: e.target.value === "true" });
    await setLoadingSpinner(true);
  };

  const handleSelectEmployee = async (id) => {
    await setLoadingSpinner(true);
    if (selectedEmployeeIds.includes(id)) {
      setSelectedEmployeeIds(
        selectedEmployeeIds.filter((employeeId) => employeeId !== id)
      );
    } else {
      setSelectedEmployeeIds([...selectedEmployeeIds, id]);
    }
    await setLoadingSpinner(false);
  };

  useEffect(() => {
    async function checkMaxDispatch() {
      var maxDispatchCount = await employees
        .filter((employee) => selectedEmployeeIds.includes(employee.id))
        .reduce((sum, employee) => sum + employee.maximumCapacity, 0);

      if (maxDispatchCount < selectedElderIds.length) {
        setMaxDispatchStatus("over");
      } else {
        setMaxDispatchStatus("under");
      }

      console.log(maxDispatchCount);
      console.log(selectedElderIds.length);
    }

    checkMaxDispatch();
  }, [selectedElderIds, selectedEmployeeIds]);

  const handleSelectElder = async (id) => {
    await setLoadingSpinner(true);
    if (selectedElderIds.includes(id)) {
      setSelectedElderIds(selectedElderIds.filter((elderId) => elderId !== id));
    } else {
      setSelectedElderIds([...selectedElderIds, id]);
    }
    await setLoadingSpinner(false);
  };

  const handleSelectAllEmployee = async () => {
    await setLoadingSpinner(true);
    if (allEmployeeSelected) {
      await setSelectedEmployeeIds([]);
    } else {
      console.log(employees);
      await setSelectedEmployeeIds(
        await employees.map((employee) => employee.id)
      );
    }
    await setAllEmployeeSelected(!allEmployeeSelected);
    await console.log(selectedEmployeeIds);
    await setLoadingSpinner(false);
  };

  const handleSelectAllElder = async () => {
    setLoadingSpinner(true);
    if (allElderSelected) {
      setSelectedElderIds([]);
    } else {
      setSelectedElderIds(elders.map((elder) => elder.id));
    }
    setAllElderSelected(!allElderSelected);
    await setLoadingSpinner(false);
  };

  useEffect(() => {
    const fetchEmployeesAndElders = async () => {
      setLoadingSpinner(true);

      if (jwt === "") {
        return;
      }
      var employees = await fetchEmployees();
      var elders = await fetchElders();

      console.log(employees);

      await setEmployees(employees);
      await setElders(elders);
      await setSelectedEmployeeIds(employees.map((employee) => employee.id));
      await setSelectedElderIds(elders.map((elder) => elder.id));
      await setLoadingSpinner(false);
    };

    fetchEmployeesAndElders();
  }, []);

  const fetchEmployees = async () => {
    await setLoadingSpinner(true);

    const myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + jwt);

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };
    const response = await fetch(
      `${config.apiUrl}/employees/` + userId,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        return result;
      })
      .catch((error) => console.error(error));

    await setLoadingSpinner(false);

    return response;
  };
  const fetchElders = async () => {
    await setLoadingSpinner(true);

    const myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + jwt);

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };
    const response = await fetch(
      `${config.apiUrl}/elders/` + userId,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        return result;
      })
      .catch((error) => console.error(error));
    console.log(response);

    await setLoadingSpinner(false);

    return response;
  };

  const handleSelect = async (employeeId, elderId, sequence) => {
    setLoadingSpinner(true);

    const selectedAssignment = {
      employee_id: employeeId === "없음" ? "없음" : Number(employeeId),
      elderly_id: elderId,
      sequence: sequence,
    };

    await setLoadingSpinner(false);

    onSelectAssignment(selectedAssignment);
  };

  async function onSelectAssignment(fixedAssignment) {
    await setLoadingSpinner(true);

    if (fixedAssignment.elderly_id === "없음") {
      // '없음'을 선택했을 때는 해당 엘더의 모든 할당을 제거

      const filteredAssignments = fixedAssignments.filter(
        (assignment) =>
          !(
            assignment.sequence === fixedAssignment.sequence &&
            assignment.employee_id === fixedAssignment.employee_id
          )
      );

      await setFixedAssignments(filteredAssignments);
    } else {
      const filteredAssignments = await fixedAssignments.filter(
        (assignment) =>
          assignment.sequence !== fixedAssignment.sequence ||
          assignment.employee_id !== fixedAssignment.employee_id
      );

      console.log(fixedAssignment);
      console.log(filteredAssignments);

      await setFixedAssignments([...filteredAssignments, fixedAssignment]);
      await setLoadingSpinner(false);
    }
  }

  const handleDeleteEmployee = async (id) => {
    await setLoadingSpinner(true);

    const myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + jwt);

    const requestOptions = {
      method: "DELETE",
      headers: myHeaders,
      redirect: "follow",
    };

    await fetch(`${config.apiUrl}/employee/` + id, requestOptions)
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.error(error));
    setEmployees((prevEmployees) =>
      prevEmployees.filter((employee) => employee.id !== id)
    );
    if (selectedEmployeeIds.includes(id)) {
      setSelectedEmployeeIds(
        selectedEmployeeIds.filter((employeeId) => employeeId !== id)
      );
    }
    await toast("직원 삭제에 성공하였습니다.");
    await setLoadingSpinner(false);
  };

  const handleDeleteElder = async (id) => {
    setLoadingSpinner(true);

    const myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + jwt);

    const requestOptions = {
      method: "DELETE",
      headers: myHeaders,
      redirect: "follow",
    };

    await fetch(`${config.apiUrl}/elder/` + id, requestOptions)
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.error(error));
    setElders((prevElders) => prevElders.filter((elder) => elder.id !== id));

    if (selectedElderIds.includes(id)) {
      setSelectedElderIds(selectedElderIds.filter((elderId) => elderId !== id));
    }

    await toast("어르신 삭제에 성공하였습니다.");
    await setLoadingSpinner(false);
  };
  const handleSignin = () => {
    navigate("/signin");
  };

  const handleComplete = async (data, type) => {
    setLoadingSpinner(true);

    let fullAddress = data.address;
    let extraAddress = "";

    if (data.addressType === "R") {
      if (data.bname !== "") {
        extraAddress += data.bname;
      }
      if (data.buildingName !== "") {
        extraAddress +=
          extraAddress !== "" ? `, ${data.buildingName}` : data.buildingName;
      }
      fullAddress += extraAddress !== "" ? ` (${extraAddress})` : "";
    }
    console.log(fullAddress);
    console.log(type);

    if (type === "employee") {
      setEditedEmployee((prevState) => ({
        ...prevState,
        homeAddressName: fullAddress,
      }));
    } else if (type === "elder") {
      setEditedElder((prevState) => ({
        ...prevState,
        homeAddressName: fullAddress,
      }));
    }
    await setLoadingSpinner(false);
  };

  const openPostcode = (type) => {
    new window.daum.Postcode({
      oncomplete: (data) => handleComplete(data, type), // Pass both data and type
    }).open();
  };

  const [addEmployeeModalIsOpen, setAddEmployeeModalIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    workPlace: company.addressName,
    homeAddress: "",
    maxCapacity: "",
    isDriver: false,
  });

  const openAddEmployeeModal = () => setAddEmployeeModalIsOpen(true);
  const closeAddEmployeeModal = () => setAddEmployeeModalIsOpen(false);

  const [addElderModalIsOpen, setAddElderModalIsOpen] = useState(false);

  const [elderFormData, setElderFormData] = useState({
    name: "",
    homeAddress: "",
    requiredFrontSeat: false,
  });

  const openAddElderModal = () => setAddElderModalIsOpen(true);
  const closeAddElderModal = () => setAddElderModalIsOpen(false);

  const handleAddEmployeeModalChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAddElderModalChange = (e) => {
    const { name, value } = e.target;
    setElderFormData({
      ...elderFormData,
      [name]: value,
    });
  };

  const handleEmployeePostcode = async () => {
    setLoadingSpinner(true);
    new window.daum.Postcode({
      oncomplete: (data) => {
        let fullAddress = data.address;
        let extraAddress = "";

        if (data.addressType === "R") {
          if (data.bname !== "") {
            extraAddress += data.bname;
          }
          if (data.buildingName !== "") {
            extraAddress +=
              extraAddress !== ""
                ? `, ${data.buildingName}`
                : data.buildingName;
          }
          fullAddress += extraAddress !== "" ? ` (${extraAddress})` : "";
        }

        setFormData({
          ...formData,
          homeAddress: fullAddress,
        });
      },
    }).open();
    await setLoadingSpinner(false);
  };

  const handleElderPostcode = async () => {
    await setLoadingSpinner(true);
    new window.daum.Postcode({
      oncomplete: (data) => {
        let fullAddress = data.address;
        let extraAddress = "";

        if (data.addressType === "R") {
          if (data.bname !== "") {
            extraAddress += data.bname;
          }
          if (data.buildingName !== "") {
            extraAddress +=
              extraAddress !== ""
                ? `, ${data.buildingName}`
                : data.buildingName;
          }
          fullAddress += extraAddress !== "" ? ` (${extraAddress})` : "";
        }

        setElderFormData({
          ...elderFormData,
          homeAddress: fullAddress,
        });
      },
    }).open();
    await setLoadingSpinner(false);
  };
  const handleSubmit = async (e) => {
    await setLoadingSpinner(true);
    e.preventDefault();

    console.log(formData);

    try {
      const response = await fetch(`${config.apiUrl}/employee/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      setEmployees(await fetchEmployees());
      await toast("직원 추가에 성공하였습니다.");
      setFormData({
        name: "",
        workPlace: company.addressName,
        homeAddress: "",
        isDriver: false,
      });

      closeAddEmployeeModal(); // 제출 후 모달 닫기
    } catch (error) {
      console.error("There was an error adding the employee!", error);
    }
    await setLoadingSpinner(false);
  };

  const handleElderSubmit = async (e) => {
    await setLoadingSpinner(true);
    e.preventDefault();

    console.log(formData);

    try {
      const response = await fetch(`${config.apiUrl}/elder/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify(elderFormData),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      setElders(await fetchElders());
      await toast("어르신 추가에 성공하였습니다.");

      await setElderFormData({
        name: "",
        homeAddress: "",
        requiredFrontSeat: false,
      });

      closeAddElderModal(); // 제출 후 모달 닫기
      setElderFormData({ name: "", homeAddress: "", requiredFrontSeat: false });
    } catch (error) {
      console.error("There was an error adding the employee!", error);
    }
    await setLoadingSpinner(false);
  };

  function handleCloseAddElderModal() {
    setAddElderModalIsOpen(false);
    setElderFormData({ name: "", homeAddress: "", requiredFrontSeat: false });
  }
  function handleCloseAddEmployeeModal() {
    setAddEmployeeModalIsOpen(false);
    setFormData({
      name: "",
      workPlace: company.addressName,
      homeAddress: "",
      isDriver: false,
    });
  }

  useEffect(() => {
    setLoadingSpinner(true);
    const savedSelections = localStorage.getItem(
      `employeeSelections_${userId}`
    );

    if (savedSelections) {
      const parsedSelections = JSON.parse(savedSelections);
      setSelections(parsedSelections);
      console.log(parsedSelections);

      let newAssignments = [...fixedAssignments]; // 기존 배열을 복사

      Object.entries(parsedSelections).forEach(
        ([employeeId, employeeSelections]) => {
          Object.entries(employeeSelections).forEach(([sequence, elderId]) => {
            const selectedAssignment = {
              employee_id: employeeId === "없음" ? "없음" : Number(employeeId),
              elderly_id: elderId,
              sequence: Number(sequence),
            };

            // 중복 확인
            const existingIndex = newAssignments.findIndex(
              (assignment) =>
                assignment.employee_id === selectedAssignment.employee_id &&
                assignment.sequence === selectedAssignment.sequence
            );

            if (existingIndex !== -1) {
              // 이미 존재하는 경우 업데이트
              newAssignments[existingIndex] = selectedAssignment;
            } else {
              // 새로운 경우 추가
              newAssignments.push(selectedAssignment);
            }
          });
        }
      );

      console.log(newAssignments);
      setFixedAssignments(newAssignments);
    }
    setLoadingSpinner(false);
  }, [userId]);

  const handleLocalFixSelect = async (employeeId, elderId, position) => {
    await setLoadingSpinner(true);

    let newSelections = { ...selections };
    if (
      newSelections[employeeId] &&
      Object.values(newSelections[employeeId]).includes(elderId)
    ) {
      toast("같은 직원에게 중복된 어르신을 고정할 수 없습니다.");

      return;
    }
    handleSelect(employeeId, elderId, position);

    if (elderId === "없음") {
      // elderId가 "없음"인 경우, 해당 선택을 제거
      if (newSelections[employeeId]) {
        const { [position]: removedPosition, ...restPositions } =
          newSelections[employeeId];
        if (Object.keys(restPositions).length === 0) {
          // 만약 이 직원의 모든 선택이 제거되었다면, 해당 직원 키도 제거
          const { [employeeId]: removedEmployee, ...restEmployees } =
            newSelections;
          newSelections = restEmployees;
        } else {
          // 그렇지 않다면, 해당 position만 제거
          newSelections[employeeId] = restPositions;
        }
      }
    } else {
      // elderId가 "없음"이 아닌 경우, 새로운 선택을 추가
      newSelections = {
        ...newSelections,
        [employeeId]: {
          ...(newSelections[employeeId] || {}),
          [position]: elderId,
        },
      };
    }

    setSelections(newSelections);

    localStorage.setItem(
      `employeeSelections_${userId}`,
      JSON.stringify(newSelections)
    );
    await setLoadingSpinner(false);
  };

  const handleSignout = async () => {
    await setLoadingSpinner(true);

    setJwt("");
    setUserId("");
    setUserEmail("");
    setIsSignin(false);
    setCompany("", "");
    setElders([]);
    setEmployees([]);
    setSelectedElderIds([]);
    setFixedAssignments([]);
    setView("current");
    setMaxDispatchStatus("under");
    setAllEmployeeSelected(true);
    setAllElderSelected(true);
    setFixedCount(0);
    window.history.replaceState({}, "");

    await setLoadingSpinner(false);
  };

  const Map = ({ setMap, map }) => {
    useEffect(() => {
      const mapContainer = document.getElementById("map");
      const mapOptions = {
        center: new kakao.maps.LatLng(35.1709043, 128.0820769), //지도의 중심좌표.
        level: 3, //지도의 레벨(확대, 축소 정도)
      };

      const kakaoMap = new kakao.maps.Map(mapContainer, mapOptions);
      setMap(kakaoMap);
    }, []);

    function setCenter({ lat, lng }) {
      const moveLatLon = new kakao.maps.LatLng(lat, lng);
      map.setCenter(moveLatLon);
    }

    function panTo({ lat, lng }) {
      const moveLatLon = new kakao.maps.LatLng(lat, lng);
      map.panTo(moveLatLon);
    }

    return (
      <>
        <div id="map" style={{ width: "100%", height: "450px" }} />
        <div style={{ display: "flex", gap: "10px" }}></div>
      </>
    );
  };

  return (
    <div className="App">
      <ToastContainer />
      {LoadingSpinner && <LoadingSpinnerOverlay />}
      <header className="App-header">
        <div className="h-16 bg-sky-950	text-white flex flex-row place-items-center ">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4">
              <div className="flex-grow"></div>
              <text className="font-bold">SILVERITHM</text>
            </div>
            <div className="flex items-center space-x-4">
              <text className="font-bold text-sm">
                {isSignin === true
                  ? `${userEmail}님 (${company.name}) 환영합니다!`
                  : "로그인이 필요합니다."}
              </text>
              <button
                className="text-xs hover:underline"
                onClick={isSignin === false ? handleSignin : handleSignout}
              >
                {isSignin === true ? "로그아웃" : "로그인"}
              </button>

              <button className="text-xs hover:underline">회원가입</button>
              <div className="flex-grow"></div>
            </div>
          </div>
        </div>
      </header>
      <main>
        <div className="flex justify-end space-x-4 mt-2">
          <div className="flex flex-row space-x-4">
            <button
              onClick={() => setView("current")}
              className={`text-base hover:underline ${
                view === "current" ? "underline" : ""
              }`}
            >
              차량 배치 진행하기
            </button>
            <button
              onClick={() => setView("one")}
              className={`text-base hover:underline ${
                view === "one" ? "underline" : ""
              }`}
            >
              단일 경로 배치 진행하기
            </button>
            <button
              onClick={() => setView("previous")}
              className={`text-base hover:underline ${
                view === "previous" ? "underline" : ""
              }`}
            >
              이전 배치 보기
            </button>
            <div className="flex-grow"></div>
          </div>
        </div>

        <div className="h-6"></div>

        {view === "current" ? (
          <div>
            <div>
              <div className="flex flex-row items-center justify-between mb-4">
                <div className="flex flex-row items-center">
                  <text className="text-lg font-bold">직원 목록</text>
                  <div className="w-6"></div>
                  <button className="text-sm hover:underline">
                    현재 선택 인원 {selectedEmployeeIds.length}명 +
                  </button>
                  <div className="w-6"></div>
                  <text className="text-sm">
                    최대 배차 인원
                    {employees
                      .filter((employee) =>
                        selectedEmployeeIds.includes(employee.id)
                      )
                      .reduce(
                        (sum, employee) => sum + employee.maximumCapacity,
                        0
                      )}
                    명
                  </text>
                </div>

                <div className="flex flex-row mr-1">
                  <button
                    onClick={() =>
                      employees.length > 5
                        ? setIsEmployeeCollapsed(!isEmployeeCollapsed)
                        : null
                    }
                    className="text-sm bg-sky-950 text-white w-20 h-8 rounded hover:bg-sky-500 "
                  >
                    {isEmployeeCollapsed ? "늘리기" : "접기"}
                  </button>
                  <div className="w-4"></div>

                  <button
                    onClick={openAddEmployeeModal}
                    className="text-sm bg-sky-950 text-white w-20 h-8 rounded hover:bg-sky-500"
                  >
                    직원 추가
                  </button>
                </div>
              </div>

              <div
                className={`relative overflow-x-auto shadow-md ${
                  isEmployeeCollapsed ? "h-80 overflow-y-scroll" : ""
                }`}
              >
                <table className="w-full text-sm text-center rtl:text-right text-gray-500 dark:text-gray-400 table-auto">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th scope="col" className="p-4">
                        <div className="flex items-center">
                          <input
                            id="employeeCheckbox-all"
                            defaultChecked={true}
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            onChange={handleSelectAllEmployee}
                          />
                          <label htmlFor="checkbox-all" className="sr-only">
                            checkbox
                          </label>
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3">
                        이름
                      </th>
                      <th scope="col" className="px-6 py-3">
                        주소
                      </th>
                      <th scope="col" className="px-6 py-3">
                        최대 인원
                      </th>

                      <th scope="col" className="px-6 py-3">
                        수정 / 삭제
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((row) => (
                      <tr key={row.id} className="hover:bg-blue-100">
                        <td className="w-4 p-4">
                          <div className="flex items-center">
                            <input
                              checked={selectedEmployeeIds.includes(row.id)}
                              onChange={() => handleSelectEmployee(row.id)}
                              id={`employeeCheckbox-table-${row.id}`}
                              type="checkbox"
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            />
                            <label
                              htmlFor={`checkbox-table-${row.id}`}
                              className="sr-only"
                            >
                              checkbox
                            </label>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {editingEmployeeId === row.id ? (
                            <input
                              value={editedEmployee.name}
                              onChange={(e) =>
                                handleEmployeeInputChange(e, "name")
                              }
                              className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 text-center"
                            />
                          ) : (
                            row.name
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {editingEmployeeId === row.id ? (
                            <input
                              onClick={() => openPostcode("employee")}
                              value={editedEmployee.homeAddressName}
                              onChange={(e) =>
                                handleEmployeeInputChange(e, "homeAddressName")
                              }
                              className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 text-center"
                            />
                          ) : (
                            row.homeAddressName
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {editingEmployeeId === row.id ? (
                            <input
                              type="number"
                              value={editedEmployee.maximumCapacity}
                              onChange={(e) =>
                                handleEmployeeInputChange(e, "maximumCapacity")
                              }
                              className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 text-center"
                            />
                          ) : (
                            row.maximumCapacity
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <button
                            onClick={() =>
                              handleEmployeeEdit(row.id, "employee")
                            }
                            className="mr-2 font-medium text-blue-600 dark:text-blue-500 hover:underline"
                          >
                            {editingEmployeeId === row.id ? "완료" : "수정"}
                          </button>
                          <button
                            onClick={() => handleDeleteEmployee(row.id)}
                            className="ml-2 font-medium text-red-600 dark:text-red-500 hover:underline"
                          >
                            삭제
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="h-10"></div>
            <div>
              <div className="flex flex-row items-center justify-between mb-4">
                <div className="flex flex-row items-center">
                  <text className="text-lg font-bold">어르신 목록</text>
                  <div className="w-6"></div>
                  <button className="text-sm hover:underline">
                    현재 선택 인원 {selectedElderIds.length}명 +
                  </button>
                  <div className="w-6"></div>
                  <text className="text-sm">
                    최대 배차 인원
                    {employees
                      .filter((employee) =>
                        selectedEmployeeIds.includes(employee.id)
                      )
                      .reduce(
                        (sum, employee) => sum + employee.maximumCapacity,
                        0
                      )}
                    명
                  </text>
                  <div className="w-4"></div>

                  {maxDisaptchStatus === "over" ? (
                    <ReportProblemIcon
                      style={{ color: "orange", fontSize: 20 }}
                    />
                  ) : (
                    <CheckCircleIcon
                      style={{ color: "#4ade80", fontSize: 20 }}
                    />
                  )}
                </div>

                <div className="flex flex-row mr-1">
                  <button
                    onClick={() =>
                      elders.length > 5
                        ? setIsElderCollapsed(!isElderCollapsed)
                        : null
                    }
                    className="text-sm bg-sky-950 text-white w-20 h-8 rounded hover:bg-sky-500 "
                  >
                    {isElderCollapsed ? "늘리기" : "접기"}
                  </button>
                  <div className="w-4"></div>

                  <button
                    onClick={openAddElderModal}
                    className="text-sm bg-sky-950 text-white w-20 h-8 rounded hover:bg-sky-500 "
                  >
                    어르신 추가
                  </button>
                </div>
              </div>

              <div
                className={`relative overflow-x-auto shadow-md ${
                  isElderCollapsed ? "h-80 overflow-y-scroll" : ""
                }`}
              >
                <table className="w-full text-sm text-center rtl:text-right text-gray-500 dark:text-gray-400 table-auto">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th scope="col" className="p-4">
                        <div className="flex items-center">
                          <input
                            id="elderCheckbox-all"
                            defaultChecked={true}
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            onChange={handleSelectAllElder}
                          />
                          <label htmlFor="checkbox-all" className="sr-only">
                            checkbox
                          </label>
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3">
                        이름
                      </th>
                      <th scope="col" className="px-6 py-3">
                        주소
                      </th>
                      <th scope="col" className="px-6 py-3">
                        앞자리 탑승 여부
                      </th>

                      <th scope="col" className="px-6 py-3">
                        수정 / 삭제
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {elders.map((row) => (
                      <tr key={row.id} className={"hover:bg-blue-100"}>
                        <td className="w-4 p-4">
                          <div className="flex items-center">
                            <input
                              onChange={() => handleSelectElder(row.id)}
                              checked={selectedElderIds.includes(row.id)}
                              id={`elderCheckbox-table-${row.id}`}
                              type="checkbox"
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            />
                            <label
                              htmlFor={`checkbox-table-${row.id}`}
                              className="sr-only"
                            >
                              checkbox
                            </label>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {editingElderId === row.id ? (
                            <input
                              value={editedElder.name}
                              onChange={(e) =>
                                handleElderInputChange(e, "name")
                              }
                              className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 text-center"
                            />
                          ) : (
                            row.name
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {editingElderId === row.id ? (
                            <input
                              onClick={() => openPostcode("elder")}
                              value={editedElder.homeAddressName}
                              onChange={(e) =>
                                handleElderInputChange(e, "address")
                              }
                              className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 text-center"
                            />
                          ) : (
                            row.homeAddressName
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {editingElderId === row.id ? (
                            <select
                              value={editedElder.requiredFrontSeat}
                              onChange={(e) =>
                                handleSelectChange(e, "requiredFrontSeat")
                              }
                              className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 text-center"
                            >
                              <option value="true">필요</option>
                              <option value="false">필요 없음</option>
                            </select>
                          ) : row.requiredFrontSeat ? (
                            "필요"
                          ) : (
                            "필요 없음"
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleElderEdit(row.id)}
                            className="font-medium text-blue-600 dark:text-blue-500 hover:underline mr-2"
                          >
                            {editingElderId === row.id ? "완료" : "수정"}
                          </button>
                          <button
                            onClick={() => handleDeleteElder(row.id)}
                            className="ml-2 font-medium text-red-600 dark:text-red-500 hover:underline"
                          >
                            삭제
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="h-10"></div>

            <div>
              <div className="flex flex-row items-center justify-between mb-4">
                <div className="flex flex-row items-center">
                  <text className="text-lg font-bold">배치 고정</text>
                  <div className="w-6"></div>

                  <button
                    onClick={() => console.log(fixedAssignments)}
                    className="text-sm hover:underline"
                  >
                    현재 고정 인원 {fixedAssignments.length}명 +
                  </button>
                  <div className="w-6"></div>
                </div>

                <div className="flex flex-row mr-1">
                  <button
                    onClick={() =>
                      employees.length > 5
                        ? setIsFixCollapsed(!isFixCollapsed)
                        : null
                    }
                    className="text-sm bg-sky-950 text-white w-20 h-8 rounded hover:bg-sky-500 "
                  >
                    {isFixCollapsed ? "늘리기" : "접기"}
                  </button>
                  <div className="w-4"></div>
                </div>
              </div>

              <div
                className={`relative overflow-x-auto shadow-md ${
                  isFixCollapsed ? "h-80 overflow-y-scroll" : ""
                }`}
              >
                <table className="w-full text-sm text-center rtl:text-right text-gray-500 dark:text-gray-400 table-auto">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        이름
                      </th>

                      <th scope="col" className="px-6 py-3">
                        고정
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((employee) => (
                      <tr key={employee.id} className="hover:bg-blue-100">
                        <td className="px-6 py-4">{employee.name}</td>
                        <td className="px-6 py-4">
                          {Array.from(
                            { length: employee.maximumCapacity },
                            (_, index) => (
                              <select
                                key={index}
                                style={{
                                  textAlign: "center",
                                  width: "100px",
                                  marginLeft: "20px",
                                }}
                                value={
                                  selections[employee.id]?.[index + 1] || "없음"
                                }
                                onChange={(e) =>
                                  handleLocalFixSelect(
                                    employee.id,
                                    e.target.value,
                                    index + 1
                                  )
                                }
                              >
                                <option value="없음">없음</option>
                                {elders.map((elder) => (
                                  <option key={elder.id} value={elder.id}>
                                    {elder.name}
                                  </option>
                                ))}
                              </select>
                            )
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="h-10"></div>
            <div className="flex flex-row items-center justify-center">
              <button
                onClick={checkDispatchInData}
                className="text-szm bg-sky-950 text-white w-60 h-16 rounded-lg hover:bg-sky-500"
              >
                출근 차량 배치
              </button>
              <div className="w-4"></div>
              <button
                onClick={checkDispatchOutData}
                className="text-sm bg-sky-950 text-white w-60 h-16 rounded-lg hover:bg-sky-500"
              >
                퇴근 차량 배치
              </button>
            </div>
            <div className="h-10"></div>
          </div>
        ) : (
          <div> 업데이트 예정</div>
        )}
      </main>

      {loading && (
        <LoadingOverlay>
          <ScaleLoader color="skyblue" loading={loading} size={50} />
          <div style={{ height: 50 }}></div>
          <ProgressBar
            variant="info"
            style={{
              width: 1000,
              height: 50,
              color: "#082F49",
            }}
            now={progress}
            label={`${progress}%`}
          />
        </LoadingOverlay>
      )}

      <MyVerticallyCenteredModal
        show={modalShow}
        onHide={() => setModalShow(false)}
        data={dispatchResult}
      />
      <MyVerticallyCenteredModalDispatchInData
        show={beforeInModalShow}
        onHide={() => setBeforeInModalShow(false)}
      />
      <MyVerticallyCenteredModalDispatchOutData
        show={beforeOutModalShow}
        onHide={() => setBeforeOutModalShow(false)}
      />
      <Modal show={addElderModalIsOpen} onHide={closeAddElderModal}>
        <Modal.Header closeButton>
          <Modal.Title>어르신 추가</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleElderSubmit}>
            <Form.Group controlId="formName">
              <Form.Label>이름</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={elderFormData.name}
                onChange={handleAddElderModalChange}
                required
              />
            </Form.Group>
            <div className="h-6"></div>

            <Form.Group controlId="formHomeAddress">
              <Form.Label>집 주소</Form.Label>
              <Form.Control
                type="text"
                name="homeAddress"
                value={elderFormData.homeAddress}
                onClick={handleElderPostcode}
                readOnly
                required
              />
            </Form.Group>
            <div className="h-6"></div>
            <Form.Group controlId="formRequiredFrontSeat">
              <Form.Label>앞자리 탑승 여부</Form.Label>
              <Form.Control
                as="select"
                name="requiredFrontSeat"
                value={elderFormData.requiredFrontSeat}
                onChange={handleAddElderModalChange}
                required
              >
                <option value="">선택하세요</option>
                <option value="true">필요</option>
                <option value="false">필요 없음</option>
              </Form.Control>
            </Form.Group>
            <div className="h-6"></div>

            <div className="flex flex-row  justify-center">
              <button
                className="bg-sky-950 text-white w-32 h-10 rounded hover:bg-sky-500 "
                variant="primary"
                type="submit"
              >
                추가
              </button>

              <button
                type="button"
                className="ml-4 bg-sky-950 text-white w-32 h-10 rounded hover:bg-sky-500 "
                variant="secondary"
                onClick={() => handleCloseAddElderModal()}
              >
                닫기
              </button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={addEmployeeModalIsOpen} onHide={closeAddEmployeeModal}>
        <Modal.Header closeButton>
          <Modal.Title>직원 추가</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formName">
              <Form.Label>이름</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleAddEmployeeModalChange}
                required
              />
            </Form.Group>
            <div className="h-6"></div>

            <Form.Group controlId="formHomeAddress">
              <Form.Label>집 주소</Form.Label>
              <Form.Control
                type="text"
                name="homeAddress"
                value={formData.homeAddress}
                onClick={handleEmployeePostcode}
                readOnly
                required
              />
            </Form.Group>
            <div className="h-6"></div>

            <Form.Group controlId="formMaxCapacity">
              <Form.Label>최대 탑승 인원</Form.Label>
              <Form.Control
                type="number"
                name="maxCapacity"
                value={formData.maxCapacity}
                onChange={handleAddEmployeeModalChange}
                required
              />
            </Form.Group>
            <div className="h-6"></div>

            <div className="flex flex-row  justify-center">
              <button
                className="bg-sky-950 text-white w-32 h-10 rounded hover:bg-sky-500 "
                variant="primary"
                type="submit"
              >
                추가
              </button>

              <button
                type="button"
                className="ml-4 bg-sky-950 text-white w-32 h-10 rounded hover:bg-sky-500 "
                variant="secondary"
                onClick={() => handleCloseAddEmployeeModal()}
              >
                닫기
              </button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );

  function MyVerticallyCenteredModalDispatchOutData(props) {
    function dispatchOutStart() {
      props.onHide();
      dispatchOut();
    }
    return (
      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            차량 배치 데이터 확인 (퇴근)
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>선택하신 데이터가 맞습니까?</h4>
          <div style={{ marginBottom: "20px" }}></div>
          <div style={{ marginBottom: "20px" }}>
            <h5>직원 목록:</h5>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {employees
                .filter((employee) => selectedEmployeeIds.includes(employee.id))
                .map((employee) => (
                  <div key={employee.id}>{employee.name}</div>
                ))}
            </div>
          </div>
          <div>
            <h5>어르신 목록:</h5>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {elders
                .filter((elder) => selectedElderIds.includes(elder.id))
                .map((elder) => (
                  <div key={elder.id}>{elder.name}</div>
                ))}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button
            className="text-sm bg-sky-950 text-white w-32 h-10 rounded hover:bg-sky-500 "
            onClick={dispatchOutStart}
          >
            차량 배치 시작하기
          </button>
          <button
            className="text-sm bg-sky-950 text-white w-32 h-10 rounded hover:bg-sky-500 "
            onClick={props.onHide}
          >
            Close
          </button>
        </Modal.Footer>
      </Modal>
    );
  }

  async function checkDispatchInData() {
    setBeforeInModalShow(true);
  }

  async function checkDispatchOutData() {
    setBeforeOutModalShow(true);
  }

  function getProgressSSE() {
    const url = `${config.apiUrl}/SSE/subscribe/${userId}`;

    const eventSource = new EventSourcePolyfill(url, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    eventSource.addEventListener("sse", (event) => {
      console.log(event);

      if (!event.data.includes("EventStream Created")) {
        setProgress(Number(event.data));
      }
    });
  }

  async function dispatchOut() {
    if (jwt === "") {
      toast("차량 배치를 진행하려면 먼저 로그인해 주세요.");
      return;
    }

    getProgressSSE();

    toast("퇴근 차량배치가 시작되었습니다.");
    await setLoading(true);

    const selectedEmployeesInfos = employees.filter((employeeInfo) =>
      selectedEmployeeIds.includes(employeeInfo.id)
    );
    const selectedElderlysInfos = elders.filter((elderlyInfo) =>
      selectedElderIds.includes(elderlyInfo.id)
    );

    const requestJson1 = {
      elderlys: selectedElderlysInfos,
      employees: selectedEmployeesInfos,
      company: { companyAddress: company.address },
      dispatchType: "OUT",
      userName: userId,
    };
    const requestJson2 = {
      elderlys: selectedElderlysInfos,
      employees: selectedEmployeesInfos,
      company: { companyAddress: company.address },
      fixedAssignments: fixedAssignments,
      dispatchType: "OUT",
      userName: userId,
    };

    if (fixedAssignments.length === 0) {
      console.log(JSON.stringify(requestJson1));
    } else {
      console.log(JSON.stringify(requestJson2));
    }

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", "Bearer " + jwt);

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body:
        fixedAssignments.length === 0
          ? JSON.stringify(requestJson1)
          : JSON.stringify(requestJson2),
      redirect: "follow",
    };

    let flag = false;
    const result = await fetch(`${config.apiUrl}/dispatch`, requestOptions)
      .then((response) => {
        if (!response.ok) {
          flag = true;
        }

        return response.json();
      })
      .catch((error) => console.error(error));

    if (flag) {
      toast("차량 배치에 실패하였습니다. 데이터를 다시 확인해 주세요.");
      setLoading(false);
      return;
    }
    toast("퇴근 차량배치가 완료되었습니다.");

    await setLoading(false);
    await setDispatchResult(result);
    await console.log(result);
    await setModalShow(true);
  }

  async function checkDispatchInData() {
    console.log(fixedAssignments);
    setBeforeInModalShow(true);
  }

  async function dispatchIn() {
    console.log(employees);

    if (jwt === "") {
      toast("차량 배치를 진행하려면 먼저 로그인해 주세요.");
      return;
    }
    getProgressSSE();

    toast("출근 차량배치가 시작되었습니다.");

    await setLoading(true);

    let selectedEmployeesInfos = employees.filter((employeeInfo) =>
      selectedEmployeeIds.includes(employeeInfo.id)
    );

    // 새로운 배열 생성
    let updatedEmployeesInfos = [];

    selectedEmployeesInfos.forEach((employeeInfo) => {
      // repeat 속성이 없거나 1 이하인 경우, 기본적으로 한 번만 추가
      let repeatCount = employeeInfo.repeat || 1;

      // repeat 횟수 만큼 반복하여 삽입
      for (let i = 0; i < repeatCount; i++) {
        updatedEmployeesInfos.push({ ...employeeInfo, repeat: 1 }); // 스프레드 연산자를 사용해 객체 복사 후, repeat 속성 초기화
      }
    });

    // 원래 배열에 새 배열을 할당
    selectedEmployeesInfos = updatedEmployeesInfos;

    console.log(selectedEmployeesInfos);

    const selectedElderlysInfos = elders.filter((elderlyInfo) =>
      selectedElderIds.includes(elderlyInfo.id)
    );

    const requestJson1 = {
      elderlys: selectedElderlysInfos,
      employees: selectedEmployeesInfos,
      company: { companyAddress: company.address },
      dispatchType: "IN",
      userName: userId,
    };
    const requestJson2 = {
      elderlys: selectedElderlysInfos,
      employees: selectedEmployeesInfos,
      company: { companyAddress: company.address },
      fixedAssignments: fixedAssignments,
      dispatchType: "IN",
      userName: userId,
    };

    if (fixedAssignments.length === 0) {
      console.log(JSON.stringify(requestJson1));
    } else {
      console.log(JSON.stringify(requestJson2));
    }

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", "Bearer " + jwt);

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body:
        fixedAssignments.length === 0
          ? JSON.stringify(requestJson1)
          : JSON.stringify(requestJson2),
      redirect: "follow",
    };

    let flag = false;
    const result = await fetch(`${config.apiUrl}/dispatch`, requestOptions)
      .then((response) => {
        if (!response.ok) {
          flag = true;
        }

        return response.json();
      })
      .catch((error) => console.error(error));

    if (flag) {
      toast(
        "차량 배치에 실패하였습니다. 로그인이나 데이터를 다시 확인해 주세요."
      );
      setLoading(false);
      return;
    }
    toast("출근 차량배치가 완료되었습니다.");

    await setLoading(false);
    await setDispatchResult(result);
    await console.log(result);
    await setModalShow(true);
  }

  function getProgressSSE() {
    const url = `${config.apiUrl}/SSE/subscribe/${userId}`;

    const eventSource = new EventSourcePolyfill(url, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    eventSource.addEventListener("sse", (event) => {
      console.log(event);

      if (!event.data.includes("EventStream Created")) {
        setProgress(Number(event.data));
      }
    });
  }

  function MyVerticallyCenteredModalDispatchInData(props) {
    function dispatchInStart() {
      props.onHide();
      dispatchIn();
    }

    return (
      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            차량 배치 데이터 확인 (출근)
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>선택하신 데이터가 맞습니까?</h4>
          <div style={{ marginBottom: "20px" }}></div>
          <div style={{ marginBottom: "20px" }}>
            <h5>직원 목록:</h5>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {employees
                .filter((employee) => selectedEmployeeIds.includes(employee.id))
                .map((employee) => (
                  <div key={employee.id}>{employee.name}</div>
                ))}
            </div>
          </div>
          <div style={{ marginBottom: "20px" }}>
            <h5>어르신 목록:</h5>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {elders
                .filter((elder) => selectedElderIds.includes(elder.id))
                .map((elder) => (
                  <div key={elder.id}>{elder.name}</div>
                ))}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button
            c
            className="text-sm bg-sky-950 text-white w-32 h-10 rounded hover:bg-sky-500 "
            onClick={dispatchInStart}
          >
            차량 배치 시작하기
          </button>
          <button
            className="text-sm bg-sky-950 text-white w-32 h-10 rounded hover:bg-sky-500 "
            onClick={props.onHide}
          >
            Close
          </button>
        </Modal.Footer>
      </Modal>
    );
  }

  function MyVerticallyCenteredModal(props) {
    const REST_API_KEY = config.restApiKey;
    const [map, setMap] = useState(null);
    var lineIndex = 0;

    const [durations, setDurations] = useState([]);

    useEffect(() => {
      async function fetchData() {
        try {
          const data = await getCarDirection();

          await setDurations(data);
        } catch (error) {
          console.error("Error getCarDirection :", error);
        } finally {
        }
      }

      if (map != null && durations != [] && colors != []) {
        fetchData();
      }
    }, [map]);

    // 호출방식의 URL을 입력합니다.
    const url = "https://apis-navi.kakaomobility.com/v1/waypoints/directions";

    function getRandomColor() {
      const letters = "0123456789ABCDEF";
      let color = "#";
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    }

    function OffsetPolyline(path) {
      const offsetX = lineIndex * 2;
      // const offsetY = lineIndex * 50;

      const offsetPath = path.map((point) => {
        const earthRadius = 6378137;
        // const offsetLatitude = (offsetY / earthRadius) * (180 / Math.PI);
        const offsetLongitude =
          (offsetX / (earthRadius * Math.cos((Math.PI * point.La) / 180))) *
          (180 / Math.PI);

        point.Ma = point.Ma + offsetLongitude;

        return point;
      });

      lineIndex++;

      return offsetPath;
    }

    async function getCarDirection() {
      var dur = [];
      randomColors = [];

      for (const result of dispatchResult) {
        let origin;
        let destination;
        let waypoints = [];
        let randomColor = await getRandomColor();
        randomColors.push(randomColor);

        if (result.dispatchType === "IN") {
          origin = {
            x: result.homeAddress.longitude,
            y: result.homeAddress.latitude,
            name: result.employeeName,
          };

          for (let i = 0; i < result.assignmentElders.length; i++) {
            let currentElder = result.assignmentElders[i];
            waypoints.push({
              x: currentElder.homeAddress.longitude,
              y: currentElder.homeAddress.latitude,
              name: currentElder.name,
            });
          }

          destination = {
            x: result.workPlace.longitude,
            y: result.workPlace.latitude,
            name: "학교",
          };
        }

        if (result.dispatchType === "OUT") {
          origin = {
            x: result.workPlace.longitude,
            y: result.workPlace.latitude,
            name: "학교",
          };

          for (let i = 0; i < result.assignmentElders.length; i++) {
            let currentElder = result.assignmentElders[i];
            waypoints.push({
              x: currentElder.homeAddress.longitude,
              y: currentElder.homeAddress.latitude,
              name: currentElder.name,
            });
          }

          destination = {
            x: result.homeAddress.longitude,
            y: result.homeAddress.latitude,
            name: result.employeeName,
          };
        }

        // 출발지(origin), 목적지(destination)의 좌표를 문자열로 변환합니다.

        const headers = {
          Authorization: `KakaoAK ${REST_API_KEY}`,
          "Content-Type": "application/json",
        };

        const body = JSON.stringify({
          origin: origin,
          destination: destination,
          waypoints: waypoints,
          priority: "RECOMMEND",
          car_fuel: "GASOLINE",
          car_hipass: false,
          alternatives: true,
          road_details: false,
        });

        try {
          const response = await fetch(url, {
            method: "POST",
            headers: headers,
            body: body,
          });

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const data = await response.json();

          const duration = await data.routes[0].summary.duration;

          dur.push(duration);

          data.routes[0].sections.forEach(async (section) => {
            const linePath = [];

            await section.roads.forEach((road) => {
              for (let i = 0; i < road.vertexes.length; i += 2) {
                const latLng = new kakao.maps.LatLng(
                  road.vertexes[i + 1],
                  road.vertexes[i]
                );
                linePath.push(latLng);
              }
            });

            var content = `<div style="
            justify-content: center;
            align-items: center;
            color: ${randomColor};
            background-color: rgba(255, 255, 255, 0.5);
            border-radius: 30px;
            font-size: 20px;
            font-weight: bold;
        ">
        ${origin.name}
        </div>`;

            var position = new kakao.maps.LatLng(origin.y, origin.x);
            var customOverlay = new kakao.maps.CustomOverlay({
              position: position,
              content: content,
            });
            customOverlay.setMap(map);

            waypoints.forEach((point) => {
              var content = `<div style="
              justify-content: center;
              align-items: center;
              color: ${randomColor};
              background-color: rgba(255, 255, 255, 0.5);
              border-radius: 30px;
              font-size: 20px;
              font-weight: bold;
          ">
          ${point.name}
          </div>`;

              var position = new kakao.maps.LatLng(point.y, point.x);
              var customOverlay = new kakao.maps.CustomOverlay({
                position: position,
                content: content,
              });
              customOverlay.setMap(map);
            });

            var content2 = `<div style="
            justify-content: center;
            align-items: center;
            color: ${randomColor};
            background-color: rgba(255, 255, 255, 0.5);
            border-radius: 30px;
            font-size: 20px;
            font-weight: bold;
        ">
        ${destination.name}
        </div>`;

            var position2 = new kakao.maps.LatLng(destination.y, destination.x);
            var customOverlay2 = new kakao.maps.CustomOverlay({
              position: position2,
              content: content2,
            });
            customOverlay2.setMap(map);

            var newPolyline = await OffsetPolyline(linePath);

            var polyline = new kakao.maps.Polyline({
              path: newPolyline,
              strokeWeight: 7,
              strokeColor: randomColor,
              strokeOpacity: 0.7,
              strokeStyle: "solid",
            });

            polyline.setMap(map);
          });
        } catch (error) {
          console.error("Error:", error);
        }
      }
      return await dur;
    }

    const getCurrentTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    };

    const currentTime = getCurrentTime();

    return (
      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            차량 배치 결과
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>
            이 운행 시간은 {currentTime} 기준 카카오맵 API로 계산된
            운행시간입니다.
          </h4>
          <h5>
            운행 당시 도로 혼잡도에 따라 운행시간은 10분 정도 차이 날 수
            있습니다.
          </h5>
          <br></br>

          <div>
            {props.data.map((item, index) => (
              <div
                key={index}
                style={{ display: "flex", marginBottom: "10px" }}
              >
                <div
                  style={{
                    color: randomColors[index],
                    marginRight: "20px",
                    fontWeight: "bold",
                  }}
                >
                  {item.employeeName}
                </div>
                <div style={{ flexDirection: "row", display: "flex" }}>
                  {item.assignmentElders.map((elder, idx) => (
                    <div key={idx}> {elder.name} &nbsp;&nbsp;&nbsp;&nbsp; </div>
                  ))}
                  <div>
                    |&nbsp;&nbsp;&nbsp;약{" "}
                    {isNaN(durations[index])
                      ? "계산중..."
                      : (durations[index] / 60).toFixed(2)}
                    분 소요
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Map setMap={setMap} map={map}></Map>
        </Modal.Body>
        <Modal.Footer>
          <button
            className="text-sm bg-sky-950 text-white w-32 h-10 rounded hover:bg-sky-500 "
            onClick={props.onHide}
          >
            Close
          </button>{" "}
        </Modal.Footer>
      </Modal>
    );
  }
}

const LoadingOverlay = styled.div`
  position: fixed; /* 화면에 고정 */
  top: 0;
  left: 0;
  width: 100%; /* 전체 화면 너비 */
  height: 100%; /* 전체 화면 높이 */
  display: flex;
  justify-content: center; /* 가운데 정렬 */
  align-items: center; /* 세로 방향으로 가운데 정렬 */
  z-index: 1000; /* 다른 요소들 위에 오도록 z-index 설정 */
  flex-direction: column;
`;

export default App;
