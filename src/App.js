import { useEffect, useState, useCallback } from "react";
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
import axios from "axios";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@atlaskit/pragmatic-drag-and-drop-react-beautiful-dnd-migration";

import "./styles/bootstrapcss.css";

import LoadingSpinnerOverlay from "./components/LoadingSpinner";

const { kakao } = window;
const AGREEMENT_LINKS = {
  privacyPolicy:
    "https://plip.kr/pcc/d9017bf3-00dc-4f8f-b750-f7668e2b7bb7/privacy/1.html", // 개인정보처리방침 URL
  termsOfService:
    " https://relic-baboon-412.notion.site/silverithm-13c766a8bb468082b91ddbd2dd6ce45d", // 서비스 이용약관 URL
};
function App() {
  const [selectedEmployeeForSingle, setSelectedEmployeeForSingle] =
    useState(null);
  const [selectedEldersForSingle, setSelectedEldersForSingle] = useState([]);
  const [showSingleRouteResult, setShowSingleRouteResult] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [view, setView] = useState("current"); // 'current' or 'previous'
  const [isEmployeeCollapsed, setIsEmployeeCollapsed] = useState(true);
  const [isElderCollapsed, setIsElderCollapsed] = useState(true);
  const [isCoupleCollapsed, setIsCoupleCollapsed] = useState(true);
  const [isFixCollapsed, setIsFixCollapsed] = useState(true);
  const [maxDisaptchStatus, setMaxDispatchStatus] = useState("under");
  const [fixedAssignments, setFixedAssignments] = useState([]);

  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [editingElderId, setEditingElderId] = useState(null);
  const [editingCoupleId, setEditingCoupleId] = useState(null);
  const [editedEmployee, setEditedEmployee] = useState({});
  const [editedElder, setEditedElder] = useState({});
  const [editedCouple, setEditedCouple] = useState({});

  const [dispatchHistories, setDispatchHistories] = useState([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);
  const [historyDetail, setHistoryDetail] = useState(null);

  const [elders, setElders] = useState([]);
  const [couples, setCouples] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [showUserMenu, setShowUserMenu] = useState(false); // 추가

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

  const [activeEmployeeId, setActiveEmployeeId] = useState(null);

  useEffect(() => {
    let timer;

    if (setLoading && progress === 0) {
      timer = setTimeout(() => {
        toast.error("연결이 끊어졌습니다. 잠시 후 다시 시도해 주세요.");
        setLoading(false);
      }, 30000);
    }

    return () => clearTimeout(timer); // 컴포넌트 언마운트 시 타이머 정리
  }, [setLoading, progress]);

  const handleEmployeeSelect = (employeeId) => {
    if (activeEmployeeId === employeeId) {
      setActiveEmployeeId(null);
    } else {
      setActiveEmployeeId(employeeId);
    }
  };
  const openAgreement = (url) => {
    window.open(url, "_blank");
  };

  const [activeCard, setActiveCard] = useState(null);

  var randomColors = [];

  const navigate = useNavigate();

  const {
    setIsSignin,
    setJwt,
    setUserId,
    setUserName,
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
    userName,
    userEmail,
    selectedElderIds,
    selectedEmployeeIds,
  } = useStore();

  const handleSignUp = () => {
    navigate("/signup");
  };

  const updateEmployee = async (id, data) => {
    setLoadingSpinner(true);

    const updateData = {
      name: data.name,
      workPlace: data.workPlaceName,
      homeAddress: data.homeAddressName,
      maxCapacity: data.maximumCapacity,
      isDriver: false,
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
    await toast.success("직원 수정에 성공하였습니다.");
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

    await toast.success("어르신 수정에 성공하였습니다.");
    await setLoadingSpinner(false);

    return response;
  };
  const updateCouple = async (id, data) => {
    setLoadingSpinner(true);
    console.log(data);
    const updateData = {
      elderId1: data.elder1.id,
      elderId2: data.elder2.id,
    };

    console.log(updateData);

    const response = await fetch(`${config.apiUrl}/couple/${id}`, {
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

    await toast.success("부부 어르신 수정에 성공하였습니다.");
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

  function transformToCoupleRequestDTO(couplesData) {
    return couplesData.map((couple) => ({
      elderId1: couple.elder1.id,
      elderId2: couple.elder2.id,
    }));
  }

  const handleCoupleEdit = async (id) => {
    setLoadingSpinner(true);
    console.log(editedCouple);
    if (editingCoupleId === id) {
      // 수정 완료
      try {
        const response = await updateCouple(id, editedCouple);
        if (response.ok) {
          console.log("response.ok");
          console.log(id);
          console.log(couples);
          console.log(editedCouple);

          // setCouples(
          //   couples.map((couple) =>
          //     couple.id === id ? { ...couple, ...editedCouple } : couple
          //   )
          // );

          setCouples(await fetchCouples());

          setEditingCoupleId(null);
          setEditedCouple({});
        } else {
          throw new Error("Server responded with an error");
        }
      } catch (error) {
        console.error("Error updating elder:", error);
      }
    } else {
      // 수정 시작
      setEditingCoupleId(id);
      setEditedCouple(couples.find((couple) => couple.coupleId === id));
    }
    await setLoadingSpinner(false);
  };

  const handleEmployeeInputChange = async (e, field) => {
    const value = e.target.value;
    let newValue;
    if (field === "maximumCapacity") {
      // 빈 문자열이거나 숫자가 아닌 경우 0으로 설정
      newValue = value === "" ? 0 : Math.max(0, parseInt(value, 10) || 0);
    } else {
      newValue = value;
    }

    setEditedEmployee({ ...editedEmployee, [field]: newValue });
  };

  const handleElderInputChange = (e, field) => {
    console.log(e.target.value);
    console.log(field);

    setEditedElder((prevState) => {
      const newState = { ...prevState, [field]: e.target.value };
      console.log("Updated state:", newState); // 디버깅을 위한 로그
      return newState;
    });
  };

  const handleCoupleInputChange = (e, field) => {
    const selectedElderId = Number(e.target.value);
    const selectedElder = elders.find((elder) => elder.id === selectedElderId);

    setEditedCouple((prevCouple) => ({
      ...prevCouple,
      [field]: selectedElder,
    }));
  };

  const handleSelectChange = async (e, field) => {
    setEditedElder({ ...editedElder, [field]: e.target.value === "true" });
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

    if (employees.length > 0 && elders.length > 0) {
      checkMaxDispatch();
    }
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

  const fetchCouples = async () => {
    await setLoadingSpinner(true);

    const myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + jwt);

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };
    const response = await fetch(
      `${config.apiUrl}/couple/` + userId,
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

  useEffect(() => {
    const fetchEmployeesAndElders = async () => {
      setLoadingSpinner(true);

      if (jwt === "") {
        return;
      }
      var employees = await fetchEmployees();
      var elders = await fetchElders();
      var couples = await fetchCouples();

      console.log(employees);

      await setEmployees(employees);
      await setElders(elders);
      await setCouples(couples);
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
    await toast.success("직원 삭제에 성공하였습니다.");
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

    await toast.success("어르신 삭제에 성공하였습니다.");
    await setLoadingSpinner(false);
  };
  const handleDeleteCouple = async (id) => {
    setLoadingSpinner(true);

    console.log(id);

    const myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + jwt);

    const requestOptions = {
      method: "DELETE",
      headers: myHeaders,
      redirect: "follow",
    };

    await fetch(`${config.apiUrl}/couple/` + id, requestOptions)
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.error(error));

    setCouples((prevCouples) =>
      prevCouples.filter((couple) => couple.coupleId !== id)
    );

    await toast.success("부부 어르신 삭제에 성공하였습니다.");
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

  const [addCoupleModalIsOpen, setAddCoupleModalIsOpen] = useState(false);

  const [elderFormData, setElderFormData] = useState({
    name: "",
    homeAddress: "",
    requiredFrontSeat: false,
  });

  const [coupleFormData, setCoupleFormData] = useState({
    elderId1: "",
    elderId2: "",
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

  const handleAddCoupleModalChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    setCoupleFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    console.log(coupleFormData);
  };

  const openAddCoupleModal = () => setAddCoupleModalIsOpen(true);
  const closeAddCoupleModal = () => setAddCoupleModalIsOpen(false);

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
      await toast.success("직원 추가에 성공하였습니다.");
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

  const updateCouples = async () => {
    const newCouples = await fetchCouples();
    setCouples((prevCouples) => newCouples);
  };

  const handleCoupleSubmit = async (e) => {
    await setLoadingSpinner(true);
    e.preventDefault();
    if (coupleFormData.elderId1 && coupleFormData.elderId2) {
      console.log(coupleFormData);

      try {
        const response = await fetch(`${config.apiUrl}/couple/${userId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify(coupleFormData),
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        await toast.success("부부 어르신 추가에 성공하였습니다.");
        setCouples(await fetchCouples());
        setCoupleFormData({
          elderId1: "",
          elderId2: "",
        });
        closeAddEmployeeModal(); // 제출 후 모달 닫기
      } catch (error) {
        console.error("There was an error adding the couple!", error);
      }
    } else {
      alert("두 명의 어르신을 모두 선택해주세요.");
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
      await toast.success("어르신 추가에 성공하였습니다.");

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

  function handleCloseAddCoupleModal() {
    setAddCoupleModalIsOpen(false);
    setCoupleFormData({
      elderId1: "",
      elderId2: "",
    });
  }

  const fetchDispatchHistories = async () => {
    setLoadingSpinner(true);
    try {
      const response = await fetch(`${config.apiUrl}/history`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch dispatch histories");
      }
      const data = await response.json();

      console.log(data);

      setDispatchHistories(data);
    } catch (error) {
      console.error("Error fetching dispatch histories:", error);
      toast.error("이전 배치 기록을 불러오는데 실패했습니다.");
    } finally {
      setLoadingSpinner(false);
    }
  };

  const fetchHistoryDetail = async (historyId) => {
    setLoadingSpinner(true);
    try {
      const response = await fetch(`${config.apiUrl}/history/${historyId}`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch history detail");
      }
      const data = await response.json();
      setHistoryDetail(data);
      setSelectedHistoryId(historyId);

      await setDispatchResult(data.assignments);
      await console.log(data.assignments);
      await setModalShow(true);
    } catch (error) {
      console.error("Error fetching history detail:", error);
      toast.error("배치 상세 정보를 불러오는데 실패했습니다.");
    } finally {
      setLoadingSpinner(false);
    }
  };

  function DispatchHistoryList({
    histories,
    onSelectHistory,
    selectedHistoryId,
  }) {
    const getDispatchTypeText = (type) => {
      if (!type) return "알 수 없음";

      switch (type) {
        case "DISTANCE_IN":
          return "거리 기반 (출근)";
        case "DISTANCE_OUT":
          return "거리 기반 (퇴근)";
        case "DURATION_IN":
          return "시간 기반 (출근)";
        case "DURATION_OUT":
          return "시간 기반 (퇴근)";
        default:
          return "알 수 없음";
      }
    };

    const splitDispatchTypeText = (text) => {
      if (!text) return { baseType: "알 수 없음", timeType: "" };

      const match = text.match(/(.*?)\s*\((.*?)\)/);
      if (match) {
        return {
          baseType: match[1], // "거리 기반" 또는 "시간 기반"
          timeType: match[2], // "출근" 또는 "퇴근"
        };
      }
      return { baseType: text, timeType: "" };
    };

    const getDispatchTypeColor = (type) => {
      if (!type) return "bg-gray-100 text-gray-800";

      if (type.includes("DISTANCE")) {
        return "bg-emerald-100 text-emerald-800";
      }
      return "bg-violet-100 text-violet-800";
    };

    const getInOutColor = (type) => {
      if (!type) return "text-gray-600";

      if (type.includes("_IN")) {
        return "text-blue-600";
      }
      return "text-orange-600";
    };

    const formatTotalTime = (seconds) => {
      if (!seconds && seconds !== 0) return "시간 정보 없음";
      console.log(seconds);

      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;

      if (hours === 0) {
        return `${remainingMinutes}분`;
      }
      return remainingMinutes === 0
        ? `${hours}시간`
        : `${hours}시간 ${remainingMinutes}분`;
    };
    return (
      <div className="h-full flex flex-col px-4">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex-none">
          이전 배치 목록
        </h2>
        <div className="flex-1 min-h-0 overflow-auto">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 content-start pb-4">
            {histories?.map((history) => {
              const dispatchTypeText = getDispatchTypeText(
                history?.dispatchType
              );
              const { baseType, timeType } =
                splitDispatchTypeText(dispatchTypeText);

              return (
                <div
                  key={history?.id}
                  className={`
                                  rounded-lg shadow-sm border border-gray-200
                                  transition-all duration-200 ease-in-out cursor-pointer
                                  hover:shadow-md hover:border-gray-300 bg-white
                                  ${
                                    selectedHistoryId === history?.id
                                      ? "ring-2 ring-sky-500"
                                      : ""
                                  }
                              `}
                  onClick={() => onSelectHistory(history?.id)}
                >
                  <div className="p-6">
                    {/* 카드 내용은 이전과 동일 */}
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-center text-gray-600 text-sm">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          ></path>
                        </svg>
                        {history?.createdAt || "날짜 정보 없음"}
                      </div>
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getDispatchTypeColor(
                            history?.dispatchType
                          )}`}
                        >
                          {baseType}
                        </span>
                        <span
                          className={`font-semibold ${getInOutColor(
                            history?.dispatchType
                          )}`}
                        >
                          {timeType}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3">
                      <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg">
                        {history?.dispatchType === "DISTANCE_IN" ||
                        history?.dispatchType === "DISTANCE_OUT" ? (
                          <p className="text-xs text-gray-500 mb-1">
                            소요 거리
                          </p>
                        ) : (
                          <p className="text-xs text-gray-500 mb-1">
                            소요 시간
                          </p>
                        )}
                        <p className="font-medium text-gray-800 text-center">
                          {history?.dispatchType === "DISTANCE_IN" ||
                          history?.dispatchType === "DISTANCE_OUT" ? (
                            <p>약 {history?.totalTime / 1000}km</p>
                          ) : (
                            <p>약 {formatTotalTime(history?.totalTime)}</p>
                          )}
                        </p>
                      </div>
                      <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">직원</p>
                        <p className="font-medium text-gray-800">
                          {history?.totalEmployees ?? 0}명
                        </p>
                      </div>
                      <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">어르신</p>
                        <p className="font-medium text-gray-800">
                          {history?.totalElders ?? 0}명
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  function DispatchHistoryDetail({ detail }) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">배치 상세 정보</h2>
        <p>배치 시간: {new Date(detail.createdAt).toLocaleString()}</p>
        <div className="mt-4">
          <h3 className="text-xl font-semibold mb-2">배치 결과</h3>
          {detail.assignments.map((assignment, index) => (
            <div key={index} className="mb-4 p-4 border rounded">
              <p>직원: {assignment.employeeName}</p>
              <p>
                배차 유형: {assignment.dispatchType === "IN" ? "출근" : "퇴근"}
              </p>
              <p>소요 시간: {assignment.time}분</p>
              <h4 className="font-semibold mt-2">배정된 어르신:</h4>
              <ul className="list-disc list-inside">
                {assignment.assignmentElders.map((elder, elderIndex) => (
                  <li key={elderIndex}>
                    {elder.name} - {elder.address}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (view) {
      case "current":
        return (
          <div className="p-4 md:p-8">
            <div className="mb-6">
              <div className="flex flex-row items-center justify-between py-4">
                <div className="flex flex-row items-center">
                  <h2 className="text-2xl font-bold">직원 목록</h2>
                  <div className="w-6"></div>
                  <button className="text-sm hover:underline text-gray-400">
                    현재 선택 인원 {selectedEmployeeIds.length}명 +
                  </button>
                  <div className="w-6"></div>
                  <text className="text-sm text-gray-400">
                    최대 배차 인원 &nbsp;
                    {employees
                      .filter((employee) =>
                        selectedEmployeeIds.includes(employee.id)
                      )
                      .reduce((sum, employee) => {
                        // 그 외의 경우 원래 employee 객체의 값을 사용
                        return sum + (employee.maximumCapacity || 0);
                      }, 0)}
                    {""}명
                  </text>
                </div>

                <div className="flex flex-row mr-1">
                  <button
                    disabled={!jwt}
                    onClick={() =>
                      employees.length > 5
                        ? setIsEmployeeCollapsed(!isEmployeeCollapsed)
                        : null
                    }
                    className={`text-sm w-20 h-8 rounded ${
                      jwt
                        ? "bg-sky-950 text-white hover:bg-sky-500"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {isEmployeeCollapsed ? "늘리기" : "접기"}
                  </button>
                  <div className="w-4"></div>

                  <button
                    disabled={!jwt}
                    onClick={openAddEmployeeModal}
                    className={`text-sm w-20 h-8 rounded ${
                      jwt
                        ? "bg-sky-950 text-white hover:bg-sky-500"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    직원 추가
                  </button>
                </div>
              </div>

              <div
                className={`relative overflow-x-auto shadow-md rounded-xl ${
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
                  <text className="text-2xl font-bold">어르신 목록</text>
                  <div className="w-6"></div>
                  <button className="text-sm hover:underline text-gray-400">
                    현재 선택 인원 {selectedElderIds.length}명 +
                  </button>
                  <div className="w-6"></div>
                  <text className="text-sm text-gray-400">
                    최대 배차 인원 &nbsp;
                    {employees
                      .filter((employee) =>
                        selectedEmployeeIds.includes(employee.id)
                      )
                      .reduce((sum, employee) => {
                        // 현재 편집 중인 직원이라면 editedEmployee의 값을 사용
                        if (editingEmployeeId === employee.id) {
                          return sum + (editedEmployee.maximumCapacity || 0);
                        }
                        // 그 외의 경우 원래 employee 객체의 값을 사용
                        return sum + (employee.maximumCapacity || 0);
                      }, 0)}
                    {""}명
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
                    disabled={!jwt}
                    onClick={() =>
                      elders.length > 5
                        ? setIsElderCollapsed(!isElderCollapsed)
                        : null
                    }
                    className={`text-sm w-20 h-8 rounded ${
                      jwt
                        ? "bg-sky-950 text-white hover:bg-sky-500"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {isElderCollapsed ? "늘리기" : "접기"}
                  </button>
                  <div className="w-4"></div>

                  <button
                    disabled={!jwt}
                    onClick={openAddElderModal}
                    className={`text-sm w-20 h-8 rounded ${
                      jwt
                        ? "bg-sky-950 text-white hover:bg-sky-500"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    어르신 추가
                  </button>
                </div>
              </div>

              <div
                className={`relative overflow-x-auto shadow-md rounded-xl ${
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
                  <text className="text-2xl font-bold">부부 어르신 목록</text>
                </div>

                <div className="flex flex-row mr-1">
                  <button
                    disabled={!jwt}
                    onClick={() =>
                      couples.length > 5
                        ? setIsCoupleCollapsed(!isCoupleCollapsed)
                        : null
                    }
                    className={`text-sm w-20 h-8 rounded ${
                      jwt
                        ? "bg-sky-950 text-white hover:bg-sky-500"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {isCoupleCollapsed ? "늘리기" : "접기"}
                  </button>
                  <div className="w-4"></div>

                  <button
                    onClick={openAddCoupleModal}
                    className={`text-sm w-32 h-8 rounded ${
                      jwt
                        ? "bg-sky-950 text-white hover:bg-sky-500"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    부부 어르신 추가
                  </button>
                </div>
              </div>

              <div
                className={`relative overflow-x-auto shadow-md rounded-xl ${
                  isCoupleCollapsed ? "h-80 overflow-y-scroll" : ""
                }`}
              >
                <table className="w-full text-sm text-center rtl:text-right text-gray-500 dark:text-gray-400 table-auto">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 h-16">
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        이름
                      </th>
                      <th scope="col" className="px-6 py-3">
                        이름
                      </th>

                      <th scope="col" className="px-6 py-3">
                        수정 / 삭제
                      </th>
                    </tr>
                  </thead>
                  {couples.map((row) => (
                    <tr key={row.coupleId} className="hover:bg-blue-100">
                      <td className="px-6 py-4">
                        {editingCoupleId === row.coupleId ? (
                          <select
                            style={{
                              textAlign: "center",
                            }}
                            value={editedCouple.elder1.id}
                            onChange={(e) =>
                              handleCoupleInputChange(e, "elder1")
                            }
                            className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                          >
                            {elders.map((elder) => (
                              <option key={elder.id} value={elder.id}>
                                {elder.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          row.elder1.name
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingCoupleId === row.coupleId ? (
                          <select
                            style={{
                              textAlign: "center",
                            }}
                            value={editedCouple.elder2.id}
                            onChange={(e) =>
                              handleCoupleInputChange(e, "elder2")
                            }
                            className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                          >
                            {elders.map((elder) => (
                              <option key={elder.id} value={elder.id}>
                                {elder.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          row.elder2.name
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleCoupleEdit(row.coupleId)}
                          className="font-medium text-blue-600 dark:text-blue-500 hover:underline mr-2"
                        >
                          {editingCoupleId === row.coupleId ? "완료" : "수정"}
                        </button>
                        <button
                          onClick={() => handleDeleteCouple(row.coupleId)}
                          className="ml-2 font-medium text-red-600 dark:text-red-500 hover:underline"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </table>
              </div>
            </div>

            <div className="h-10"></div>

            <div>
              <div className="flex flex-row items-center justify-between mb-4">
                <div className="flex flex-row items-center">
                  <text className="text-2xl font-bold">배치 고정</text>
                  <div className="w-6"></div>

                  <button
                    onClick={() => console.log(fixedAssignments)}
                    className="text-sm hover:underline text-gray-400"
                  >
                    현재 고정 인원 {fixedAssignments.length}명 +
                  </button>
                  <div className="w-6"></div>
                </div>

                <div className="flex flex-row mr-1">
                  <button
                    disabled={!jwt}
                    onClick={() =>
                      employees.length > 5
                        ? setIsFixCollapsed(!isFixCollapsed)
                        : null
                    }
                    className={`text-sm w-20 h-8 rounded ${
                      jwt
                        ? "bg-sky-950 text-white hover:bg-sky-500"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {isFixCollapsed ? "늘리기" : "접기"}
                  </button>
                </div>
              </div>

              <div
                className={`relative overflow-x-auto shadow-md rounded-xl ${
                  isFixCollapsed ? "h-80 overflow-y-scroll" : ""
                }`}
              >
                <table className="w-full text-sm text-center rtl:text-right text-gray-500 dark:text-gray-400 table-auto">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 h-16">
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
                                className="rounded h-8"
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
                disabled={!jwt}
                onClick={checkDispatchInData}
                className={`text-sm w-60 h-12 rounded ${
                  jwt
                    ? "bg-sky-950 text-white hover:bg-sky-500"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                출근 차량 배치
              </button>
              <div className="w-4"></div>
              <button
                disabled={!jwt}
                onClick={checkDispatchOutData}
                className={`text-sm w-60 h-12 rounded ${
                  jwt
                    ? "bg-sky-950 text-white hover:bg-sky-500"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                퇴근 차량 배치
              </button>
            </div>
            <div className="h-10"></div>
          </div>
        );
      case "previous":
        return (
          <div className="flex gap-6 h-[calc(100vh-250px)] overflow-hidden">
            {/* 왼쪽: 이전 배치 목록 영역 */}
            <div className="flex-1 overflow-hidden py-4">
              {dispatchHistories.length > 0 ? (
                <DispatchHistoryList
                  histories={dispatchHistories}
                  onSelectHistory={fetchHistoryDetail}
                  selectedHistoryId={selectedHistoryId}
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200 text-gray-500">
                  배치 기록이 없습니다
                </div>
              )}
            </div>
          </div>
        );
      case "one":
        const maxCapacity = selectedEmployeeForSingle?.maximumCapacity || 0;
        const handleSingleRouteDispatch = async () => {
          if (!selectedEmployeeForSingle) {
            toast.warn("직원을 선택해주세요.");
            return;
          }
          if (selectedEldersForSingle.length === 0) {
            toast.warn("어르신을 선택해주세요.");
            return;
          }

          try {
            setLoadingSpinner(true);

            // 단일 경로 배치 결과 데이터 구성
            const singleRouteResult = [
              {
                employeeName: selectedEmployeeForSingle.name,
                homeAddress: selectedEmployeeForSingle.homeAddress,
                workPlace: selectedEmployeeForSingle.workPlace,
                assignmentElders: elders
                  .filter((elder) => selectedEldersForSingle.includes(elder.id))
                  .map((elder) => ({
                    name: elder.name,
                    homeAddress: elder.homeAddress,
                  })),
                dispatchType: "DISTANCE_IN",
                isSingleRoute: true,
              },
            ];

            console.log(singleRouteResult);

            // 기존 모달에 사용할 데이터 설정
            setDispatchResult(singleRouteResult);
            setModalShow(true);
          } catch (error) {
            console.error("Error in single route dispatch:", error);
            toast.error("배치 처리 중 오류가 발생했습니다.");
          } finally {
            setLoadingSpinner(false);
          }
        };

        return (
          <div className="w-full h-[calc(100vh-250px)] bg-gray-50/50 overflow-auto">
            <div className="px-4 py-4">
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    단일 경로 배치
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    직원과 어르신을 선택하여 단일 경로를 검색하세요
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    disabled={!jwt}
                    className={`
                      px-6 py-2 text-sm font-medium rounded-lg transition-colors
                      ${
                        jwt &&
                        selectedEmployeeForSingle &&
                        selectedEldersForSingle.length > 0
                          ? "bg-sky-600 text-white hover:bg-sky-500"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }
                    `}
                    onClick={handleSingleRouteDispatch}
                  >
                    단일 경로 길 찾기
                  </button>
                </div>
              </div>

              {/* 그리드 컨테이너 */}
              <div className="grid grid-cols-3 gap-8 h-[600px]">
                {/* 직원 선택 */}
                <div className="h-full">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
                    <div className="p-4 border-b border-gray-100 flex-none">
                      <h2 className="font-medium text-lg text-gray-800">
                        직원 선택
                      </h2>
                    </div>
                    <div className="flex-1 overflow-hidden p-4">
                      {jwt ? (
                        <div className="h-full overflow-auto pr-2 space-y-2">
                          {employees.map((employee) => (
                            <div
                              key={employee.id}
                              onClick={() => {
                                setSelectedEmployeeForSingle(employee);
                                setSelectedEldersForSingle([]);
                              }}
                              className={`
                        group p-4 rounded-lg border transition-all cursor-pointer
                        ${
                          selectedEmployeeForSingle?.id === employee.id
                            ? "bg-sky-50 border-sky-500 shadow-sm"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }
                      `}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-gray-900">
                                  {employee.name}
                                </span>
                                <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                                  최대 {employee.maximumCapacity}명
                                </span>
                              </div>
                              <div className="text-sm text-gray-500">
                                {employee.homeAddressName}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-400">
                          선택된 정보가 없습니다
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 어르신 선택 */}
                <div className="h-full">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
                    <div className="p-4 border-b border-gray-100 flex-none flex justify-between items-center">
                      <h2 className="font-medium text-lg text-gray-800">
                        어르신 선택
                      </h2>
                      {selectedEmployeeForSingle && (
                        <span className="text-sm px-2 py-1 bg-sky-50 text-sky-600 rounded-full">
                          {selectedEldersForSingle.length}/{maxCapacity}명
                        </span>
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden p-4">
                      {selectedEmployeeForSingle ? (
                        <div className="h-full overflow-auto pr-2 space-y-2">
                          {elders.map((elder) => (
                            <div
                              key={elder.id}
                              onClick={() => {
                                if (
                                  selectedEldersForSingle.includes(elder.id)
                                ) {
                                  setSelectedEldersForSingle(
                                    selectedEldersForSingle.filter(
                                      (id) => id !== elder.id
                                    )
                                  );
                                } else if (
                                  selectedEldersForSingle.length < maxCapacity
                                ) {
                                  setSelectedEldersForSingle([
                                    ...selectedEldersForSingle,
                                    elder.id,
                                  ]);
                                } else {
                                  toast.warn(
                                    `최대 ${maxCapacity}명까지 선택 가능합니다.`
                                  );
                                }
                              }}
                              className={`
                                group p-4 rounded-lg border transition-all cursor-pointer
                                ${
                                  selectedEldersForSingle.includes(elder.id)
                                    ? "bg-sky-50 border-sky-500 shadow-sm"
                                    : selectedEldersForSingle.length >=
                                      maxCapacity
                                    ? "opacity-50 cursor-not-allowed border-gray-200"
                                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                }
                              `}
                            >
                              <div className="font-medium text-gray-900">
                                {elder.name}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                {elder.homeAddressName}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-400">
                          직원을 먼저 선택해주세요
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 선택 요약 */}
                <div className="h-full">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
                    <div className="p-4 border-b border-gray-100 flex-none">
                      <h2 className="font-medium text-lg text-gray-800">
                        선택된 정보
                      </h2>
                    </div>
                    <div className="flex-1 overflow-hidden p-4">
                      <div className="h-full overflow-auto">
                        {selectedEmployeeForSingle ? (
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-sm font-medium text-gray-500 mb-2">
                                직원
                              </h3>
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <div className="text-gray-900">
                                  {selectedEmployeeForSingle.name}
                                </div>
                              </div>
                            </div>
                            {selectedEldersForSingle.length > 0 && (
                              <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-2">
                                  선택된 어르신
                                </h3>
                                <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                                  {elders
                                    .filter((elder) =>
                                      selectedEldersForSingle.includes(elder.id)
                                    )
                                    .map((elder, index) => (
                                      <div
                                        key={elder.id}
                                        className="flex items-center text-gray-900"
                                      >
                                        <span className="text-sky-600 mr-2">
                                          {index + 1}.
                                        </span>
                                        {elder.name}
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center text-gray-400">
                            선택된 정보가 없습니다
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <div>알 수 없는 탭</div>;
    }
  };
  useEffect(() => {
    setLoadingSpinner(true);
    // const savedSelections = localStorage.getItem(
    //   `employeeSelections_${userId}`
    // );

    // if (savedSelections) {
    //   const parsedSelections = JSON.parse(savedSelections);
    //   setSelections(parsedSelections);
    //   console.log(parsedSelections);

    //   let newAssignments = [...fixedAssignments]; // 기존 배열을 복사

    //   Object.entries(parsedSelections).forEach(
    //     ([employeeId, employeeSelections]) => {
    //       Object.entries(employeeSelections).forEach(([sequence, elderId]) => {
    //         const selectedAssignment = {
    //           employee_id: employeeId === "없음" ? "없음" : Number(employeeId),
    //           elderly_id: elderId,
    //           sequence: Number(sequence),
    //         };

    //         // 중복 확인
    //         const existingIndex = newAssignments.findIndex(
    //           (assignment) =>
    //             assignment.employee_id === selectedAssignment.employee_id &&
    //             assignment.sequence === selectedAssignment.sequence
    //         );

    //         if (existingIndex !== -1) {
    //           // 이미 존재하는 경우 업데이트
    //           newAssignments[existingIndex] = selectedAssignment;
    //         } else {
    //           // 새로운 경우 추가
    //           newAssignments.push(selectedAssignment);
    //         }
    //       });
    //     }
    //   );

    //   console.log(newAssignments);
    //   setFixedAssignments(newAssignments);
    // }
    setLoadingSpinner(false);
  }, [userId]);

  const handleLocalFixSelect = async (employeeId, elderId, position) => {
    await setLoadingSpinner(true);

    let newSelections = { ...selections };
    if (
      newSelections[employeeId] &&
      Object.values(newSelections[employeeId]).includes(elderId)
    ) {
      toast.warn("같은 직원에게 중복된 어르신을 고정할 수 없습니다.");
      await setLoadingSpinner(false);

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
      await setLoadingSpinner(false);
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

  function updateProgressStatus(progress) {
    if (progress === 0) {
      return <div>연결 중 . . .</div>;
    }
    if (progress >= 1 && progress <= 5) {
      return <div>거리 행렬 생성 중 ...</div>;
    } else if (progress > 5 && progress <= 79) {
      if (progress % 3 <= 0 && progress % 3 <= 1) {
        return <div>유전 알고리즘 계산 중 . </div>;
      }

      if (progress % 3 <= 1 && progress % 3 <= 2) {
        return <div>유전 알고리즘 계산 중 . . </div>;
      }

      if (progress % 3 <= 2 && progress % 3 <= 3) {
        return <div>유전 알고리즘 계산 중 . . .</div>;
      }
      return <div>유전 알고리즘 계산 중 </div>;
    } else if (progress >= 79) {
      return <div>최종 결과 생성 중 . . .</div>;
    }
  }

  const handleSignout = async () => {
    setShowLogoutModal(false); // 모달 닫기
    await setLoadingSpinner(true);

    navigate("/");
    setJwt("");
    setUserId("");
    setUserEmail("");
    setUserName("");
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
  const Map = ({
    setMap,
    map,
    isSingleRoute,
    employeeLongitude,
    employeeLatitude,
  }) => {
    console.log(isSingleRoute, employeeLongitude, employeeLatitude);

    useEffect(() => {
      const mapContainer = document.getElementById("map");
      const mapOptions = !isSingleRoute
        ? {
            center: new kakao.maps.LatLng(
              company.address.latitude,
              company.address.longitude
            ), //지도의 중심좌표.
            level: 3, //지도의 레벨(확대, 축소 정도)
          }
        : {
            center: new kakao.maps.LatLng(employeeLatitude, employeeLongitude), //지도의 중심좌표.
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
      <div className="w-full h-full relative">
        <div id="map" className="w-full h-full absolute inset-0" />
      </div>
    );
  };
  const navigationItems = [
    { id: "current", label: "인공지능 차량 배치", icon: "🚗" },
    { id: "one", label: "단일 경로 길 찾기", icon: "🛣️" },
    { id: "previous", label: "이전 배치 보기", icon: "📋" },
  ];
  return (
    <div className="App">
      <ToastContainer />
      {LoadingSpinner && <LoadingSpinnerOverlay />}
      <header className="bg-gradient-to-r from-sky-950 to-blue-900 shadow-lg">
        {/* Top Bar */}
        <div className="">
          <div className="h-16 px-6 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <h1
                className="text-white text-xl font-bold tracking-wider hover:text-sky-200 transition-colors cursor-pointer"
                onClick={() => navigate("/")}
              >
                SILVERITHM
              </h1>
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-6">
              {isSignin && (
                <div className="flex items-center gap-4">
                  {/* 사용자 정보 */}
                  <div className="flex items-center gap-2 text-sky-100">
                    <div className="w-8 h-8 bg-sky-700 rounded-full flex items-center justify-center">
                      <span className="text-sky-100 font-medium">
                        {userName?.charAt(0)}
                      </span>
                    </div>
                    <span>
                      {userName}님 ({company.name})
                    </span>
                  </div>

                  {/* 내 정보 버튼 */}
                  <button
                    onClick={() => navigate("/my-profile")}
                    className="px-1.5 py-1.5 text-sm text-sky-100 hover:text-white rounded-full hover:bg-sky-600 transition-colors"
                  >
                    내 정보
                  </button>

                  {/* 로그아웃 버튼 */}
                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className="px-1.5 py-1.5 text-sm text-sky-100 hover:text-white rounded-full hover:bg-sky-600 transition-colors"
                  >
                    로그아웃
                  </button>
                  <Modal
                    show={showLogoutModal}
                    onHide={() => setShowLogoutModal(false)}
                    centered
                  >
                    <div className="bg-white rounded-lg overflow-hidden">
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          로그아웃
                        </h3>
                        <p className="text-gray-600">
                          정말 로그아웃 하시겠습니까?
                        </p>
                      </div>
                      <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                        <button
                          onClick={() => setShowLogoutModal(false)}
                          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          취소
                        </button>
                        <button
                          onClick={handleSignout}
                          className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          로그아웃
                        </button>
                      </div>
                    </div>
                  </Modal>
                </div>
              )}

              {!isSignin && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSignin}
                    className="px-3 py-1.5 text-sm text-sky-100 hover:text-white rounded-full hover:bg-sky-600 transition-colors"
                  >
                    로그인
                  </button>
                  <span className="text-gray-400">|</span>
                  <button
                    onClick={handleSignUp}
                    className="px-3 py-1.5 text-sm text-white rounded-full hover:bg-sky-600 transition-all"
                  >
                    회원가입
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="px-6 pb-3">
            <div className="flex justify-end space-x-1">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setView(item.id);
                    if (item.id === "previous" && jwt) {
                      fetchDispatchHistories();
                    }
                  }}
                  className={`
                  px-4 py-2 
                  text-sm font-medium 
                  rounded-full
                  transition-all 
                  duration-200
                  ${
                    view === item.id
                      ? "text-white bg-sky-700/50 shadow-inner"
                      : "text-sky-200 hover:text-white hover:bg-sky-800/30"
                  }
                `}
                >
                  <span className="flex items-center gap-2">{item.label}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>
      </header>
      <main>
        <div className=""></div>
        {renderContent()}
      </main>
      <footer className="bg-gradient-to-r from-sky-950 to-blue-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="space-y-2">
            {/* Headers */}
            <div className="flex justify-between">
              <h3 className="text-xs font-semibold text-sky-100">회사 정보</h3>
              <h3 className="text-xs font-semibold text-sky-100">법적 고지</h3>
            </div>

            {/* Content */}
            <div className="flex justify-between">
              {/* Company Info */}
              <div className="text-xs text-gray-300 flex gap-6">
                <div className="flex items-center space-x-1.5">
                  <span className="text-sky-300">회사명</span>
                  <span className="text-gray-400 text-xs">|</span>
                  <span>silverithm</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-sky-300">주소</span>
                  <span className="text-gray-400 text-xs">|</span>
                  <span>서울특별시 신림동 1547-10</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-sky-300">이메일</span>
                  <span className="text-gray-400 text-xs">|</span>
                  <span>ggprgrkjh2@gmail.com</span>
                </div>
              </div>

              {/* Legal Links */}
              <div className="flex items-center space-x-4 text-xs text-gray-300">
                <a
                  onClick={() => openAgreement(AGREEMENT_LINKS.privacyPolicy)}
                  className="text-white hover:text-sky-300  duration-200 cursor-pointer"
                >
                  개인정보 처리방침
                </a>
                <span className="text-gray-600">|</span>
                <a
                  onClick={() => openAgreement(AGREEMENT_LINKS.termsOfService)}
                  className="text-white hover:text-sky-300  duration-200 cursor-pointer"
                >
                  서비스 이용약관
                </a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-2">
            <p className="text-center text-xs text-gray-400">
              &copy; {new Date().getFullYear()} silverithm. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      {loading && (
        <LoadingOverlay>
          <ScaleLoader color="skyblue" loading={loading} size={50} />
          <div style={{ height: 10 }}></div>
          <div
            style={{
              color: "#082F49",
            }}
          >
            {updateProgressStatus(progress)}
          </div>
          <div style={{ height: 10 }}></div>
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
      <Modal show={addCoupleModalIsOpen} onHide={closeAddCoupleModal}>
        <Modal.Header closeButton>
          <Modal.Title>부부 어르신 추가</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCoupleSubmit}>
            <Form.Group controlId="formElder1">
              <Form.Label>어르신 1</Form.Label>
              <Form.Control
                as="select"
                name="elderId1"
                value={coupleFormData.elderId1}
                onChange={handleAddCoupleModalChange}
                required
              >
                <option value="">선택하세요</option>
                {elders.map((elder) => (
                  <option key={elder.id} value={elder.id}>
                    {elder.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <div className="h-6"></div>

            <Form.Group controlId="formElder2">
              <Form.Label>어르신 2</Form.Label>
              <Form.Control
                as="select"
                name="elderId2"
                value={coupleFormData.elderId2}
                onChange={handleAddCoupleModalChange}
                required
              >
                <option value="">선택하세요</option>
                {elders.map((elder) => (
                  <option key={elder.id} value={elder.id}>
                    {elder.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <div className="h-6"></div>

            <div className="flex flex-row justify-center">
              <button
                className="bg-sky-950 text-white w-32 h-10 rounded hover:bg-sky-500"
                type="submit"
              >
                추가
              </button>
              <button
                type="button"
                className="ml-4 bg-sky-950 text-white w-32 h-10 rounded hover:bg-sky-500"
                onClick={handleCloseAddCoupleModal}
              >
                닫기
              </button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
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
    function dispatchOutStart(dispatchType) {
      props.onHide();
      dispatchOut(dispatchType);
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
            onClick={() => dispatchOutStart("DISTANCE_OUT")}
          >
            거리 기준 배차
          </button>
          <button
            className="text-sm bg-sky-950 text-white w-32 h-10 rounded hover:bg-sky-500 "
            onClick={() => dispatchOutStart("DURATION_OUT")}
          >
            시간 기준 배차
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
    // 선택된 직원들의 총 최대 수용 인원 계산
    const totalEmployeeCapacity = employees
      .filter((emp) => selectedEmployeeIds.includes(emp.id))
      .reduce((sum, emp) => sum + emp.maxCapacity, 0);

    // 선택된 어르신 수
    const selectedEldersCount = selectedElderIds.length;
    const selectedEmployeeCount = selectedEmployeeIds.length;

    if (selectedEmployeeCount > selectedEldersCount) {
      toast.warn("선택된 어르신 수는 직원들의 수보다 적을 수 없습니다.");
      return;
    }

    // 체크 로직
    if (selectedEldersCount > totalEmployeeCapacity) {
      toast.warn("선택된 어르신 수가 직원들의 최대 배차 인원을 초과했습니다.");
      return;
    }

    if (selectedEmployeeIds.length === 0) {
      toast.warn("직원을 선택해주세요.");
      return;
    }

    if (selectedElderIds.length === 0) {
      toast.warn("어르신을 선택해주세요.");
      return;
    }

    // 모든 조건을 통과하면 모달 표시
    setBeforeInModalShow(true);
  }

  async function checkDispatchOutData() {
    // 선택된 직원들의 총 최대 수용 인원 계산
    const totalEmployeeCapacity = employees
      .filter((emp) => selectedEmployeeIds.includes(emp.id))
      .reduce((sum, emp) => sum + emp.maxCapacity, 0);

    // 선택된 어르신 수
    const selectedEldersCount = selectedElderIds.length;

    // 체크 로직
    if (selectedEldersCount > totalEmployeeCapacity) {
      toast.warn("선택된 어르신 수가 직원들의 최대 수용 인원을 초과했습니다.");
      return;
    }

    if (selectedEmployeeIds.length === 0) {
      toast.warn("직원을 선택해주세요.");
      return;
    }

    if (selectedElderIds.length === 0) {
      toast.warn("어르신을 선택해주세요.");
      return;
    }

    // 모든 조건을 통과하면 모달 표시
    setBeforeOutModalShow(true);
  }

  function getProgressSSE(jobId) {
    const url = `${config.dispatchUrl}/SSE/subscribe/${jobId}`;

    setProgress(0);

    const timeout = setTimeout(() => {
      if (eventSource) {
        eventSource.close();
        toast.error("시간 초과로 연결이 종료되었습니다.");
        setLoading(false);
      }
    }, 1 * 60 * 1000); // 10분

    const eventSource = new EventSourcePolyfill(url, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    eventSource.addEventListener("sse", (event) => {
      console.log(event);
      clearTimeout(timeout);

      if (!event.data.includes("EventStream Created")) {
        setProgress(Number(event.data));
      }
    });

    eventSource.addEventListener("dispatch", (event) => {
      console.log("Dispatch Result Event:", event);
      clearTimeout(timeout);

      try {
        const dispatchResult = JSON.parse(event.data);
        setDispatchResult(dispatchResult);
        setModalShow(true);
        toast.info("배차가 완료되었습니다.");
        setLoading(false);
        eventSource.close();
      } catch (error) {
        console.error("Dispatch result parsing error:", error);
        toast.error("결과 처리 중 오류가 발생했습니다.");
        setLoading(false);
        eventSource.close();
      }
    });

    eventSource.addEventListener("dispatch-error", (error) => {
      clearTimeout(timeout);

      console.error("SSE Error:", error);
      toast.error("연결이 끊어졌습니다. 잠시 후 다시 시도해 주세요.");
      setLoading(false);
      eventSource.close();
    });

    // eventSource.onerror = (error) => {
    //   console.error("SSE Error:", error);
    //   toast.error("연결이 끊어졌습니다. 다시 시도해주세요.");
    //   setLoading(false);
    //   eventSource.close();
    // };
  }

  async function dispatchOut(dispatchType) {
    if (jwt === "") {
      toast.warn("차량 배치를 진행하려면 먼저 로그인해 주세요.");
      return;
    }

    setLoading(true);
    toast.info("퇴근 차량배치가 시작되었습니다.");

    const selectedEmployeesInfos = employees.filter((employeeInfo) =>
      selectedEmployeeIds.includes(employeeInfo.id)
    );
    const selectedElderlysInfos = elders.filter((elderlyInfo) =>
      selectedElderIds.includes(elderlyInfo.id)
    );

    const baseRequestData = {
      elderlys: selectedElderlysInfos,
      couples: transformToCoupleRequestDTO(couples),
      employees: selectedEmployeesInfos,
      company: { companyAddress: company.address },
      dispatchType: dispatchType,
      userName: userId,
    };

    const requestData =
      fixedAssignments.length === 0
        ? baseRequestData
        : { ...baseRequestData, fixedAssignments };

    console.log(requestData);

    try {
      var result = await axios.post(`${config.apiUrl}/dispatch`, requestData, {
        validateStatus: function (status) {
          return true;
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        timeout: 1800000, // 30 minutes
      });
      console.log(result.data);
      getProgressSSE(result.data);

      console.log(result);
    } catch {}
  }
  async function dispatchIn(dispatchType) {
    if (jwt === "") {
      toast.warn("차량 배치를 진행하려면 먼저 로그인해 주세요.");
      return;
    }

    setLoading(true);
    toast.info("출근 차량배치가 시작되었습니다.");

    // Request data preparation with repeat handling
    let selectedEmployeesInfos = employees.filter((employeeInfo) =>
      selectedEmployeeIds.includes(employeeInfo.id)
    );

    // Handle employee repeats
    const updatedEmployeesInfos = selectedEmployeesInfos.flatMap(
      (employeeInfo) => {
        const repeatCount = employeeInfo.repeat || 1;
        return Array(repeatCount)
          .fill(null)
          .map(() => ({
            ...employeeInfo,
            repeat: 1,
          }));
      }
    );

    const selectedElderlysInfos = elders.filter((elderlyInfo) =>
      selectedElderIds.includes(elderlyInfo.id)
    );

    const baseRequestData = {
      elderlys: selectedElderlysInfos,
      couples: transformToCoupleRequestDTO(couples),
      employees: updatedEmployeesInfos,
      company: { companyAddress: company.address },
      dispatchType: dispatchType,
      userName: userId,
    };

    const requestData =
      !fixedAssignments || fixedAssignments.length === 0
        ? baseRequestData
        : { ...baseRequestData, fixedAssignments };

    console.log(requestData);

    try {
      var result = await axios.post(`${config.apiUrl}/dispatch`, requestData, {
        validateStatus: function (status) {
          return true;
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        timeout: 1800000, // 30 minutes
      });

      getProgressSSE(result.data);
      console.log(result.data);
    } catch (error) {}
  }

  function MyVerticallyCenteredModalDispatchInData(props) {
    function dispatchInStart(dispatchType) {
      props.onHide();
      dispatchIn(dispatchType);
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
            onClick={() => dispatchInStart("DISTANCE_IN")}
          >
            거리 기준 배차
          </button>
          <button
            c
            className="text-sm bg-sky-950 text-white w-32 h-10 rounded hover:bg-sky-500 "
            onClick={() => dispatchInStart("DURATION_IN")}
          >
            시간 기준 배차
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
    const [durations, setDurations] = useState([]);
    const [dispatchData, setDispatchData] = useState([]);
    const [mapOverlays, setMapOverlays] = useState([]);
    const [randomColors, setRandomColors] = useState([]); // 색상을 state로 관리
    var lineIndex = 0;
    // props.data가 변경될 때만 dispatchData 초기화

    // 초기 데이터 설정
    useEffect(() => {
      if (props.data) {
        setDispatchData(props.data);
      }
    }, [props.data]);

    // 지도 업데이트
    useEffect(() => {
      if (map) {
        updateMapDisplay();
      }
    }, [map, dispatchData]); // dispatchData가 변경될 때마다 지도 업데이트

    // 지도 표시 업데이트 함수
    const updateMapDisplay = useCallback(async () => {
      // 기존 오버레이 제거
      mapOverlays.forEach((overlay) => {
        if (overlay) {
          overlay.setMap(null);
        }
      });
      setMapOverlays([]);

      // 맵 초기화
      if (map) {
        map.removeOverlayMapTypeId(kakao.maps.MapTypeId.TRAFFIC);
        map.removeOverlayMapTypeId(kakao.maps.MapTypeId.BICYCLE);
        map.removeOverlayMapTypeId(kakao.maps.MapTypeId.USE_DISTRICT);
      }

      lineIndex = 0;

      if (props.data && props.data.length > 0) {
        const firstResult = dispatchData?.[0];

        // isSingleRoute가 true일 때 직원 위치로 중심점 설정
        if (firstResult.isSingleRoute && firstResult.homeAddress) {
          const employeePosition = new kakao.maps.LatLng(
            firstResult.homeAddress.latitude,
            firstResult.homeAddress.longitude
          );

          map.setCenter(employeePosition);
          map.setLevel(3); // 적절한 줌 레벨 설정
        }
      }

      const data = await getCarDirection();
      setDurations(data);
    }, [map, dispatchData]);

    const firstResult = dispatchData?.[0];
    const isSingleRoute = firstResult?.isSingleRoute || false;

    console.log(props);
    const handleDragEnd = async (result) => {
      if (!result.destination) return;

      const { source, destination } = result;
      const sourceDroppableId = parseInt(source.droppableId);
      const destDroppableId = parseInt(destination.droppableId);

      // 깊은 복사로 새로운 배열 생성
      const newDispatchResult = JSON.parse(JSON.stringify(dispatchResult));

      // 소스 그룹의 현재 어르신 수 확인
      const sourceElders =
        newDispatchResult[sourceDroppableId].assignmentElders;

      // 이동 후 소스 그룹에 남을 어르신 수가 1명 이하인 경우
      if (sourceElders.length <= 1 && sourceDroppableId !== destDroppableId) {
        toast.warn("최소 1명의 어르신이 배정되어야 합니다.", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return; // 드래그 앤 드롭 취소
      }

      if (sourceDroppableId === destDroppableId) {
        // 같은 직원 내에서 순서 변경
        const elders = Array.from(
          newDispatchResult[sourceDroppableId].assignmentElders
        );
        const [removed] = elders.splice(source.index, 1);
        elders.splice(destination.index, 0, removed);
        newDispatchResult[sourceDroppableId].assignmentElders = elders;
      } else {
        // 다른 직원으로 이동
        const sourceElders = Array.from(
          newDispatchResult[sourceDroppableId].assignmentElders
        );
        const destElders = Array.from(
          newDispatchResult[destDroppableId].assignmentElders
        );

        const [removed] = sourceElders.splice(source.index, 1);
        destElders.splice(destination.index, 0, removed);

        newDispatchResult[sourceDroppableId].assignmentElders = sourceElders;
        newDispatchResult[destDroppableId].assignmentElders = destElders;
      }

      // 상태 업데이트
      setDispatchResult(newDispatchResult);

      // 지도의 기존 오버레이 제거
      if (map) {
        mapOverlays.forEach((overlay) => {
          overlay.setMap(null);
        });
        setMapOverlays([]);

        // 새로운 경로 계산 및 그리기
        await getCarDirection();
      }
    };

    // 호출방식의 URL을 입력합니다.
    const url = "https://apis-navi.kakaomobility.com/v1/waypoints/directions";

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

    function hexToHSL(hex) {
      let r = parseInt(hex.slice(1, 3), 16) / 255;
      let g = parseInt(hex.slice(3, 5), 16) / 255;
      let b = parseInt(hex.slice(5, 7), 16) / 255;

      let max = Math.max(r, g, b),
        min = Math.min(r, g, b);
      let h,
        s,
        l = (max + min) / 2;

      if (max === min) {
        h = s = 0;
      } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;
          case g:
            h = (b - r) / d + 2;
            break;
          case b:
            h = (r - g) / d + 4;
            break;
        }
        h /= 6;
      }

      return { h: h * 360, s: s * 100, l: l * 100 };
    }

    function hslToHex({ h, s, l }) {
      l = Math.min(100, Math.max(0, l));
      s = Math.min(100, Math.max(0, s));

      l /= 100;
      const a = (s * Math.min(l, 1 - l)) / 100;
      const f = (n) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color)
          .toString(16)
          .padStart(2, "0");
      };
      return `#${f(0)}${f(8)}${f(4)}`;
    }

    // 스타일 관련 함수들
    function getLineStyle(index) {
      const baseColors = [
        "#FF3B30",
        "#FF9500",
        "#FFCC00",
        "#4CD964",
        "#5856D6",
        "#007AFF",
        "#5856D6",
        "#FF2D55",
        "#E73B3B",
        "#35C759",
        "#147EFB",
        "#53D769",
        "#FC3158",
        "#8E8E93",
        "#FF9600",
        "#B620E0",
        "#00C7BE",
        "#59C2FF",
        "#5856D6",
        "#FF6482",
      ];

      function adjustColor(color, index) {
        const hsl = hexToHSL(color);
        hsl.l += ((index % 3) - 1) * 5;
        hsl.s += (index % 2) * 10;
        return hslToHex(hsl);
      }

      const baseColorIndex = index % baseColors.length;
      const variationIndex = Math.floor(index / baseColors.length);
      const color = adjustColor(baseColors[baseColorIndex], variationIndex);

      return {
        color: color,
        strokeWidth: 5,
        opacity: 0.85,
      };
    }
    async function getCarDirection() {
      if (!map || !dispatchData.length) return [];

      const dur = [];
      const newRandomColors = [];

      // 기존 오버레이 제거
      mapOverlays.forEach((overlay) => {
        overlay.setMap(null);
      });
      setMapOverlays([]);

      console.log(dispatchData);

      // dispatchData를 사용하도록 수정
      for (const [index, result] of dispatchData.entries()) {
        console.log(result);
        console.log(activeEmployeeId);
        if (
          activeEmployeeId === null ||
          activeEmployeeId === result.employeeId
        ) {
          let origin;
          let destination;
          let waypoints = [];
          const lineStyle = getLineStyle(index);
          newRandomColors.push(lineStyle.color);

          // 경로 유형에 따른 origin, destination, waypoints 설정
          if (result.isSingleRoute) {
            origin = {
              x: result.homeAddress.longitude,
              y: result.homeAddress.latitude,
              name: result.employeeName,
              type: "출발",
            };

            const lastElder =
              result.assignmentElders[result.assignmentElders.length - 1];
            destination = {
              x: lastElder.homeAddress.longitude,
              y: lastElder.homeAddress.latitude,
              name: lastElder.name,
              type: "도착",
            };

            for (let i = 0; i < result.assignmentElders.length - 1; i++) {
              let currentElder = result.assignmentElders[i];
              waypoints.push({
                x: currentElder.homeAddress.longitude,
                y: currentElder.homeAddress.latitude,
                name: currentElder.name,
                type: "경유",
              });
            }
          } else if (
            result.dispatchType === "DISTANCE_IN" ||
            result.dispatchType === "DURATION_IN"
          ) {
            origin = {
              x: result.homeAddress.longitude,
              y: result.homeAddress.latitude,
              name: result.employeeName,
              type: "출발",
            };

            for (let i = 0; i < result.assignmentElders.length; i++) {
              let currentElder = result.assignmentElders[i];
              waypoints.push({
                x: currentElder.homeAddress.longitude,
                y: currentElder.homeAddress.latitude,
                name: currentElder.name,
                type: "경유",
              });
            }

            destination = {
              x: result.workPlace.longitude,
              y: result.workPlace.latitude,
              name: "학교",
              type: "도착",
            };
          } else if (
            result.dispatchType === "DISTANCE_OUT" ||
            result.dispatchType === "DURATION_OUT"
          ) {
            origin = {
              x: result.workPlace.longitude,
              y: result.workPlace.latitude,
              name: "학교",
              type: "출발",
            };

            for (let i = 0; i < result.assignmentElders.length; i++) {
              let currentElder = result.assignmentElders[i];
              waypoints.push({
                x: currentElder.homeAddress.longitude,
                y: currentElder.homeAddress.latitude,
                name: currentElder.name,
                type: "경유",
              });
            }

            destination = {
              x: result.homeAddress.longitude,
              y: result.homeAddress.latitude,
              name: result.employeeName,
              type: "도착",
            };
          }

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
            dur[index] = duration;

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

              // ... 마커 및 경로선 그리기 로직 유지
              const createMarkerContent = (point, index = "") => {
                const typeLabel = {
                  출발: "출발",
                  경유: index,
                  도착: "도착",
                };

                return `
                          <div style="
                              padding: 4px 8px;
                              color: ${lineStyle.color};
                              background-color: white;
                              border: 2px solid ${lineStyle.color};
                              border-radius: 12px;
                              font-size: 12px;
                              font-weight: bold;
                              box-shadow: 0 1px 2px rgba(0,0,0,0.1);
                              white-space: nowrap;
                          ">
                              ${point.name} 
                              <span style="
                                  font-weight: normal;
                                  opacity: 0.7;
                                  margin-left: 2px;
                                  font-size: 10px;
                              ">
                                  ${typeLabel[point.type]}
                              </span>
                          </div>
                      `;
              };

              // 마커와 경로선을 생성하고 mapOverlays에 추가
              const startOverlay = new kakao.maps.CustomOverlay({
                position: new kakao.maps.LatLng(origin.y, origin.x),
                content: createMarkerContent(origin),
                map: map,
              });
              setMapOverlays((prev) => [...prev, startOverlay]);

              waypoints.forEach((point, idx) => {
                const waypointOverlay = new kakao.maps.CustomOverlay({
                  position: new kakao.maps.LatLng(point.y, point.x),
                  content: createMarkerContent(point, (idx + 1).toString()),
                  map: map,
                });
                setMapOverlays((prev) => [...prev, waypointOverlay]);
              });

              const endOverlay = new kakao.maps.CustomOverlay({
                position: new kakao.maps.LatLng(destination.y, destination.x),
                content: createMarkerContent(destination),
                map: map,
              });
              setMapOverlays((prev) => [...prev, endOverlay]);

              const newPolyline = await OffsetPolyline(linePath);

              const backgroundPolyline = new kakao.maps.Polyline({
                path: newPolyline,
                strokeWeight: lineStyle.strokeWidth + 4,
                strokeColor: "#FFFFFF",
                strokeOpacity: 0.9,
                strokeStyle: "solid",
                map: map,
              });
              setMapOverlays((prev) => [...prev, backgroundPolyline]);

              const mainPolyline = new kakao.maps.Polyline({
                path: newPolyline,
                strokeWeight: lineStyle.strokeWidth,
                strokeColor: lineStyle.color,
                strokeOpacity: lineStyle.opacity,
                strokeStyle: "solid",
                map: map,
              });
              setMapOverlays((prev) => [...prev, mainPolyline]);
            });
          } catch (error) {
            console.error("Error:", error);
          }
        }
      }

      setRandomColors(newRandomColors);
      return dur;
    }

    const getCurrentTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    };

    const currentTime = getCurrentTime();

    const handleModalClose = () => {
      setActiveEmployeeId(null); // 선택된 직원 상태 초기화
      props.onHide(); // 기존 모달 닫기 함수 호출
    };
    const formatDispatchResult = (dispatchData, durations) => {
      if (
        !dispatchData ||
        !Array.isArray(dispatchData) ||
        dispatchData.length === 0
      ) {
        return "배차 결과가 없습니다.";
      }

      const firstDispatch = dispatchData[0];
      const isInbound = firstDispatch?.dispatchType?.includes("IN") ?? false;
      const header = `[${isInbound ? "출근" : "퇴근"} 배차 결과]\n\n`;

      const body = dispatchData
        .map((result, index) => {
          if (!result || !result.employeeName) {
            return "데이터 오류\n\n";
          }

          let formattedText = `-${result.employeeName}\n`;

          // 어르신 목록 처리
          const elders = result.assignmentElders || [];
          if (elders.length > 0) {
            formattedText += elders.map((elder) => elder.name).join(" ") + "\n";
          }

          return formattedText + "\n";
        })
        .join("");

      return header + body;
    };

    const handleCopyResult = async () => {
      try {
        // dispatchData와 durations가 모두 존재하는지 확인
        if (!dispatchData || !durations) {
          toast.error("배차 결과가 아직 준비되지 않았습니다.");
          return;
        }

        const formattedText = formatDispatchResult(dispatchData, durations);
        await navigator.clipboard.writeText(formattedText);
        toast.success("결과가 클립보드에 복사되었습니다.");
      } catch (err) {
        console.error("클립보드 복사 실패:", err);
        toast.error("클립보드 복사에 실패했습니다.");
      }
    };

    const isInbound = dispatchData[0]?.dispatchType?.includes("IN") ?? false;

    return (
      <Modal
        {...props}
        size="xl"
        centered
        aria-labelledby="dispatch-result-modal"
        dialogClassName="!max-w-[1200px] !w-[90vw]"
      >
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="max-h-[80vh] bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
              <div className="px-6 py-4 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    차량 배치 결과 {isInbound ? "- 출근" : "- 퇴근"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {currentTime} 기준
                  </p>
                </div>
                <button
                  onClick={handleModalClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg
                    className="w-6 h-6 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div
              className="p-6 overflow-auto"
              style={{ maxHeight: "calc(80vh - 73px)" }}
            >
              <div className="max-w-6xl mx-auto space-y-6">
                {/* Notice Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg py-2.5 px-4">
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-blue-500 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="flex-1 text-sm">
                      <span className="font-medium text-blue-900">
                        카카오맵 API 기준 예상 운행시간입니다.
                      </span>
                      <span className="text-blue-800 ml-2">
                        실제 도로 혼잡도에 따라 ±10분 정도 차이날 수 있습니다.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Side - Map */}
                  <div className="w-full h-full rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="h-[450px]">
                      <Map
                        setMap={setMap}
                        map={map}
                        isSingleRoute={isSingleRoute}
                        employeeLongitude={firstResult?.homeAddress?.longitude}
                        employeeLatitude={firstResult?.homeAddress?.latitude}
                      />
                    </div>
                  </div>

                  {/* Right Side - Assignment Details */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="max-h-[400px] overflow-y-auto pr-2">
                      <div className="space-y-3">
                        {dispatchData.map((item, dispatchIndex) => (
                          <div
                            key={`dispatch-${dispatchIndex}`}
                            className={`p-4 border border-gray-100 rounded-lg transition-colors ${
                              activeEmployeeId === item.employeeId
                                ? "bg-blue-100"
                                : ""
                            }  `}
                          >
                            <div
                              className={`flex items-start `}
                              onClick={() =>
                                handleEmployeeSelect(item.employeeId)
                              }
                            >
                              <div
                                key={item.employeeId}
                                className={`flex-shrink-0 font-medium w-24 employee-card `}
                                style={{
                                  color:
                                    randomColors[
                                      dispatchIndex % randomColors.length
                                    ],
                                }}
                              >
                                {item.employeeName}
                              </div>

                              <div className="flex-1 min-w-0">
                                <Droppable
                                  droppableId={`${dispatchIndex}`}
                                  direction="horizontal"
                                >
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.droppableProps}
                                      className="flex flex-wrap gap-2 mb-2"
                                    >
                                      {item.assignmentElders.map(
                                        (elder, elderIndex) => (
                                          <Draggable
                                            key={`elder-${
                                              elder.id || elderIndex
                                            }`}
                                            draggableId={`${dispatchIndex}-${
                                              elder.id || elderIndex
                                            }`}
                                            index={elderIndex}
                                          >
                                            {(provided, snapshot) => (
                                              <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className={`px-2 py-1 bg-gray-100 rounded text-sm whitespace-nowrap cursor-move
                                            ${
                                              snapshot.isDragging
                                                ? "shadow-lg bg-blue-50"
                                                : ""
                                            }`}
                                              >
                                                {elder.name}
                                              </div>
                                            )}
                                          </Draggable>
                                        )
                                      )}
                                      {provided.placeholder}
                                    </div>
                                  )}
                                </Droppable>

                                <div className="flex items-center text-sm text-gray-600">
                                  <svg
                                    className="w-4 h-4 mr-1 flex-shrink-0"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  예상 소요시간 :
                                  <span className="font-medium ml-1">
                                    {activeEmployeeId &&
                                    activeEmployeeId !== item.employeeId
                                      ? "" // 다른 직원이 선택되었을 때는 빈 문자열
                                      : isNaN(durations[dispatchIndex])
                                      ? "계산중..."
                                      : `약 ${(
                                          durations[dispatchIndex] / 60
                                        ).toFixed(0)}분`}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex justify-end">
                <button
                  onClick={handleCopyResult}
                  className="bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center px-4 py-2"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                    />
                  </svg>
                  결과 복사
                </button>
                <div className="w-2"></div>
                <button
                  onClick={handleModalClose}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </DragDropContext>
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
