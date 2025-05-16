import { useEffect, useState, useCallback, useRef } from "react";
import { UNSAFE_ErrorResponseImpl, useNavigate } from "react-router-dom";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { toast, ToastContainer } from "react-toastify";
import config from "./config";
import useStore from "./store/useStore";
import Modal from "react-bootstrap/Modal";
import React from "react";
import { EventSourcePolyfill } from "event-source-polyfill";
import { styled } from "styled-components";
import ScaleLoader from "react-spinners/ScaleLoader";
import { Form } from "react-bootstrap";
import axios from "axios";
import SubscriptionBadges from "./components/PricingModal";
import { isExpiredSubscription } from "./utils/SubscriptionUtils";

import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@atlaskit/pragmatic-drag-and-drop-react-beautiful-dnd-migration";

import "./styles/bootstrapcss.css";
import axiosInstance from "./components/AxiosInstance";

import LoadingSpinnerOverlay from "./components/LoadingSpinner";
import * as xlsx from "xlsx";

const { kakao } = window;
const AGREEMENT_LINKS = {
  privacyPolicy:
    "https://plip.kr/pcc/d9017bf3-00dc-4f8f-b750-f7668e2b7bb7/privacy/1.html", // 개인정보처리방침 URL
  termsOfService:
    "https://relic-baboon-412.notion.site/silverithm-13c766a8bb468082b91ddbd2dd6ce45d", // 서비스 이용약관 URL
};

const directionsCache = {};

function App() {
  const [selectedEmployeeForSingle, setSelectedEmployeeForSingle] =
    useState(null);
  const [selectedEldersForSingle, setSelectedEldersForSingle] = useState([]);
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

  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  // 엑셀 업로드 모달 상태
  const [showEmployeeExcelModal, setShowEmployeeExcelModal] = useState(false);
  const [showElderExcelModal, setShowElderExcelModal] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [employeeExcelPreviewData, setEmployeeExcelPreviewData] = useState([]);
  const [elderExcelPreviewData, setElderExcelPreviewData] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const employeeFileInputRef = useRef(null);
  const elderFileInputRef = useRef(null);

  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [elderSearchTerm, setElderSearchTerm] = useState('');

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchHistories(newPage);
  };

  // 엑셀 관련 함수들
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const modalType = showEmployeeExcelModal ? "employee" : "elder";
      handleExcelFile(e.dataTransfer.files[0], modalType);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const modalType = showEmployeeExcelModal ? "employee" : "elder";
      handleExcelFile(e.target.files[0], modalType);
    }
  };

  const handleExcelFile = (file, type) => {
    setExcelFile(file);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = xlsx.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

        // 첫 번째 행은 헤더로 간주
        const headers = jsonData[0];
        const rows = jsonData
          .slice(1)
          .filter((row) =>
            row.some((cell) => cell !== undefined && cell !== "")
          );

        // 헤더 형식 검증
        let isValidFormat = true;
        let expectedHeaders = [];

        if (type === "employee") {
          // 직원 엑셀 파일의 필수 헤더
          expectedHeaders = ["이름", "유형", "주소", "최대 인원"];
          // 헤더에 필수 항목이 포함되어 있는지 확인
          isValidFormat = expectedHeaders.every((header) =>
            headers.includes(header)
          );
        } else if (type === "elder") {
          // 어르신 엑셀 파일의 필수 헤더
          expectedHeaders = ["이름", "주소", "앞자리 탑승 여부"];
          // 헤더에 필수 항목이 포함되어 있는지 확인
          isValidFormat = expectedHeaders.every((header) =>
            headers.includes(header)
          );
        }

        if (!isValidFormat) {
          // 형식이 맞지 않을 경우 오류 메시지 표시
          toast.error(
            `올바른 ${
              type === "employee" ? "직원" : "어르신"
            } 데이터 형식이 아닙니다. 예시 파일을 참고하세요.`
          );
          return;
        }

        // 직원 데이터의 경우 최대 인원 값 검증
        if (type === "employee") {
          const maxCapacityIndex = headers.indexOf("최대 인원");

          if (maxCapacityIndex !== -1) {
            // 최대 인원 값이 0 또는 음수인 행이 있는지 확인
            const hasInvalidCapacity = rows.some((row) => {
              const maxCapacity = row[maxCapacityIndex];
              return (
                maxCapacity !== undefined &&
                (maxCapacity <= 0 || isNaN(parseInt(maxCapacity)))
              );
            });

            if (hasInvalidCapacity) {
              toast.error("직원 데이터의 최대 인원은 1명 이상이어야 합니다.");
              return;
            }
          }
        }

        // 비어있는 컬럼 제거 - 유효한 헤더 인덱스 찾기
        const validHeaderIndexes = headers
          .map((header, index) => {
            // 헤더가 있고, 최소 하나의 행에 데이터가 있으면 유효한 컬럼으로 간주
            const hasData = rows.some(
              (row) => row[index] !== undefined && row[index] !== ""
            );
            return header && hasData ? index : -1;
          })
          .filter((index) => index !== -1);

        // 유효한 헤더만 선택
        const validHeaders = validHeaderIndexes.map((index) => headers[index]);

        // 미리보기용 데이터 (최대 5행) - 유효한 컬럼만 포함
        const previewData = rows.slice(0, 5).map((row) => {
          const rowData = {};
          validHeaderIndexes.forEach((index) => {
            rowData[headers[index]] =
              row[index] !== undefined ? row[index] : "";
          });
          return rowData;
        });

        // 모달 타입에 따라 다른 상태 업데이트
        if (type === "employee") {
          setEmployeeExcelPreviewData(previewData);
        } else if (type === "elder") {
          setElderExcelPreviewData(previewData);
        }
      } catch (error) {
        console.error("엑셀 파일 처리 오류:", error);
        toast.error("엑셀 파일을 처리하는 중 오류가 발생했습니다.");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleEmployeeExcelUpload = async () => {
    if (!excelFile) {
      toast.error("엑셀 파일을 선택해주세요.");
      return;
    }

    // 데이터 미리보기가 없으면 형식이 맞지 않는 것으로 간주
    if (employeeExcelPreviewData.length === 0) {
      toast.error(
        "올바른 직원 데이터 형식이 아닙니다. 예시 파일을 참고하세요."
      );
      return;
    }

    // 필수 필드가 모든 행에 있는지 확인
    const requiredFields = ["이름", "유형", "주소", "최대 인원"];
    const isMissingRequiredFields = employeeExcelPreviewData.some(
      (row) =>
        !requiredFields.every(
          (field) => Object.keys(row).includes(field) && row[field] !== ""
        )
    );

    if (isMissingRequiredFields) {
      toast.warning(
        "일부 행에 필수 정보가 누락되었습니다. 모든 필드를 채워주세요."
      );
      return;
    }

    // 최대 인원 값이 0 또는 음수인지 확인
    const hasInvalidCapacity = employeeExcelPreviewData.some((row) => {
      const maxCapacity = parseInt(row["최대 인원"], 10);
      return isNaN(maxCapacity) || maxCapacity <= 0;
    });

    if (hasInvalidCapacity) {
      toast.error("직원 데이터의 최대 인원은 1명 이상이어야 합니다.");
      return;
    }

    setLoadingSpinner(true);

    try {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = xlsx.read(data, { type: "array" });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = xlsx.utils.sheet_to_json(worksheet);

          const formattedData = jsonData.map((row) => {
            let maxCapacity = parseInt(row["최대 인원"] || 0, 10);

            return {
              name: row["이름"],
              workPlace: company.addressName,
              homeAddress: row["주소"],
              maxCapacity: maxCapacity,
              isDriver: row["유형"] === "운전원",
            };
          });

          // API 호출로 직원 일괄 추가
          const response = await axiosInstance.post(
            "/employees/bulk",
            formattedData
          );

          if (response.status === 200 || response.status === 201) {
            toast.success("직원 데이터가 성공적으로 업로드되었습니다.");
            // 직원 목록 새로고침
            const employees = await fetchEmployees();
            setEmployees(employees);
            setShowEmployeeExcelModal(false);
            setExcelFile(null);
            setEmployeeExcelPreviewData([]);
          }
        } catch (error) {
          console.error("직원 데이터 업로드 오류:", error);
          toast.error("직원 데이터를 업로드하는 중 오류가 발생했습니다.");
        } finally {
          setLoadingSpinner(false);
        }
      };

      reader.readAsArrayBuffer(excelFile);
    } catch (error) {
      console.error("엑셀 파일 처리 오류:", error);
      toast.error("엑셀 파일을 처리하는 중 오류가 발생했습니다.");
      setLoadingSpinner(false);
    }
  };

  const handleElderExcelUpload = async () => {
    if (!excelFile) {
      toast.error("엑셀 파일을 선택해주세요.");
      return;
    }

    // 데이터 미리보기가 없으면 형식이 맞지 않는 것으로 간주
    if (elderExcelPreviewData.length === 0) {
      toast.error(
        "올바른 어르신 데이터 형식이 아닙니다. 예시 파일을 참고하세요."
      );
      return;
    }

    // 필수 필드가 모든 행에 있는지 확인
    const requiredFields = ["이름", "주소"];
    const isMissingRequiredFields = elderExcelPreviewData.some(
      (row) =>
        !requiredFields.every(
          (field) => Object.keys(row).includes(field) && row[field] !== ""
        )
    );

    if (isMissingRequiredFields) {
      toast.warning(
        "일부 행에 필수 정보가 누락되었습니다. 모든 필드를 채워주세요."
      );
    }

    setLoadingSpinner(true);

    try {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = xlsx.read(data, { type: "array" });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = xlsx.utils.sheet_to_json(worksheet);

          // 데이터 형식 변환
          const formattedData = jsonData.map((row) => ({
            name: row["이름"],
            homeAddress: row["주소"],
            requiredFrontSeat: row["앞자리 탑승 여부"] === "필요" || false,
          }));

          // API 호출로 어르신 일괄 추가
          const response = await axiosInstance.post(
            "/elders/bulk",
            formattedData
          );

          if (response.status === 200 || response.status === 201) {
            toast.success("어르신 데이터가 성공적으로 업로드되었습니다.");
            // 어르신 목록 새로고침
            const elders = await fetchElders();
            setElders(elders);
            setShowElderExcelModal(false);
            setExcelFile(null);
            setElderExcelPreviewData([]);
          }
        } catch (error) {
          console.error("어르신 데이터 업로드 오류:", error);
          toast.error("어르신 데이터를 업로드하는 중 오류가 발생했습니다.");
        } finally {
          setLoadingSpinner(false);
        }
      };

      reader.readAsArrayBuffer(excelFile);
    } catch (error) {
      console.error("엑셀 파일 처리 오류:", error);
      toast.error("엑셀 파일을 처리하는 중 오류가 발생했습니다.");
      setLoadingSpinner(false);
    }
  };

  const getExampleExcel = (type) => {
    let headers = [];
    let exampleData = [];

    if (type === "employee") {
      headers = ["이름", "유형", "주소", "최대 인원"];
      exampleData = [
        ["홍길동", "운전원", "서울시 강남구 역삼동 123-45", 4],
        ["김철수", "직원", "서울시 서초구 방배동 789-10", 2],
        ["이영희", "직원", "서울시 마포구 합정동 456-78", 1],
      ];
    } else if (type === "elder") {
      headers = ["이름", "주소", "앞자리 탑승 여부"];
      exampleData = [
        ["박노인", "서울시 종로구 인사동 12-34", "필요"],
        ["최어르신", "서울시 용산구 한남동 56-78", "필요 없음"],
        ["정할머니", "서울시 강서구 화곡동 90-12", "필요"],
      ];
    }

    // 엑셀 워크시트 생성
    const ws = xlsx.utils.aoa_to_sheet([headers, ...exampleData]);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "예시 데이터");

    // 엑셀 파일 다운로드
    xlsx.writeFile(
      wb,
      `${type === "employee" ? "직원" : "어르신"}_업로드_예시.xlsx`
    );
  };

  const fetchHistories = async (page) => {
    try {
      const response = await axiosInstance.get("/history", {
        params: {
          page: page,
          size: 9,
          sort: "createdAt,desc",
        },
      });

      setDispatchHistories(response.data.content);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.number);
    } catch (error) {
      console.error("Failed to fetch histories:", error);
    }
  };

  useEffect(() => {
    let timer;

    if (setLoading && progress === 0) {
      timer = setTimeout(() => {
        toast.error("연결이 끊어졌습니다. 잠시 후 다시 시도해 주세요.");
        setLoading(false);
      }, 30000 * 5);
    }

    return () => clearTimeout(timer); // 컴포넌트 언마운트 시 타이머 정리
  }, [setLoading, progress]);

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
    setSubscriptionType,
    setSubscriptionStatus,
    setSubscriptionStartDate,
    setSubscriptionEndDate,
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
    subscriptionType,
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
      isDriver: data.isDriver,
    };

    try {
      const response = await axiosInstance.put(`/employee/${id}`, updateData);

      return response;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Something went wrong";
      throw new Error(errorMessage);
    } finally {
      setLoadingSpinner(false);
    }
  };

  const updateElder = async (id, data) => {
    setLoadingSpinner(true);
    const updateData = {
      name: data.name,
      homeAddress: data.homeAddressName,
      requiredFrontSeat: data.requiredFrontSeat,
    };

    try {
      const response = await axiosInstance.put(`/elder/${id}`, updateData);

      return response;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Something went wrong";
      throw new Error(errorMessage);
    } finally {
      setLoadingSpinner(false);
    }
  };
  const updateCouple = async (id, data) => {
    setLoadingSpinner(true);
    const updateData = {
      elderId1: data.elder1.id,
      elderId2: data.elder2.id,
    };

    try {
      const response = await axiosInstance.put(`/couple/${id}`, updateData);

      return response;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Something went wrong";
      throw new Error(errorMessage);
    } finally {
      setLoadingSpinner(false);
    }
  };

  const handleEmployeeEdit = async (id) => {
    setLoadingSpinner(true);
    if (editingEmployeeId === id) {
      try {
        const response = await updateEmployee(id, editedEmployee);
        console.log(response);
        console.log(response.status);
        if (response.status === 200) {
          setEmployees(
            employees.map((emp) =>
              emp.id === id ? { ...emp, ...editedEmployee } : emp
            )
          );
          setEditingEmployeeId(null);
          setEditedEmployee({});
          await toast.success("직원 수정에 성공하였습니다.");
        } else {
          throw new Error("Server responded with an error");
        }
      } catch (error) {
        await toast.error("직원 수정에 실패하였습니다.");
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
        if (response.status === 200) {
          setElders(
            elders.map((elder) =>
              elder.id === id ? { ...elder, ...editedElder } : elder
            )
          );
          setEditingElderId(null);
          setEditedElder({});
          await toast.success("어르신 수정에 성공하였습니다.");
        } else {
          throw new Error("Server responded with an error");
        }
      } catch (error) {
        await toast.error("어르신 수정에 실패하였습니다.");
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
    if (editingCoupleId === id) {
      try {
        const response = await updateCouple(id, editedCouple);
        if (response.status === 200) {
          setCouples(await fetchCouples());

          setEditingCoupleId(null);
          setEditedCouple({});
          await toast.success("부부 어르신 수정에 성공하였습니다.");
        } else {
          throw new Error("Server responded with an error");
        }
      } catch (error) {
        console.error("Error updating elder:", error);
      }
    } else {
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
    } else if (field === "isDriver") {
      newValue = value === "true";
    } else {
      newValue = value;
    }

    setEditedEmployee({ ...editedEmployee, [field]: newValue });
  };

  const handleElderInputChange = (e, field) => {
    setEditedElder((prevState) => {
      const newState = { ...prevState, [field]: e.target.value };
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
      await setSelectedEmployeeIds(
        await employees.map((employee) => employee.id)
      );
    }
    await setAllEmployeeSelected(!allEmployeeSelected);
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
    const response = await axiosInstance
      .get(`/couple/${userId}`)
      .then((response) => response.data)
      .catch((error) => {
        console.error(error);
        throw error; // 에러를 상위로 전파
      });

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
      var subscription = await getUserSubscription();

      await setSubscriptionType(getSubscriptionType(subscription));
      await setSubscriptionStatus(subscription.status);
      await setSubscriptionStartDate(subscription.startDate);
      await setSubscriptionEndDate(subscription.endDate);

      await setEmployees(employees);
      await setElders(elders);
      await setCouples(couples);
      await setSelectedEmployeeIds(employees.map((employee) => employee.id));
      await setSelectedElderIds(elders.map((elder) => elder.id));
      await setLoadingSpinner(false);
    };

    fetchEmployeesAndElders();
  }, []);

  // 앱이 시작될 때 로그인 상태일 경우 구독 정보를 새로 가져오는 useEffect
  useEffect(() => {
    const refreshSubscriptionInfo = async () => {
      if (jwt !== "" && isSignin) {
        try {
          const subscription = await getUserSubscription();
          
          // 구독 정보 업데이트
          await setSubscriptionType(getSubscriptionType(subscription));
          await setSubscriptionStatus(subscription.status);
          await setSubscriptionStartDate(subscription.startDate);
          await setSubscriptionEndDate(subscription.endDate);
          
          console.log("구독 정보가 새로 업데이트되었습니다.");
        } catch (error) {
          console.error("구독 정보 가져오기 실패:", error);
        }
      }
    };

    refreshSubscriptionInfo();
  }, [jwt, isSignin]);

  const getSubscriptionType = (subscription) => {
    if (
      !subscription ||
      !subscription.planName ||
      subscription.status === "INACTIVE" ||
      isExpiredSubscription(subscription)
    ) {
      return "free";
    }

    // Get the plan name and billing type
    const planName = subscription.planName.toLowerCase();
    const billingType = subscription.billingType.toLowerCase();

    // Handle Basic plan
    if (planName === "basic") {
      return billingType === "monthly" ? "basicMonthly" : "basicYearly";
    }

    // Handle Premium plan
    if (planName === "enterprise") {
      return billingType === "monthly" ? "premiumMonthly" : "premiumYearly";
    }

    // Default to free if none of the above conditions are met
    return "free";
  };

  const getUserSubscription = async () => {
    const myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + jwt);

    const response = await axiosInstance
      .get(`/user/subscription`)
      .then((response) => response.data)
      .catch((error) => {
        console.error(error);
        throw error;
      });

    return response;
  };

  const fetchEmployees = async () => {
    await setLoadingSpinner(true);

    const myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + jwt);

    const response = await axiosInstance
      .get(`/employees/${userId}`)
      .then((response) => response.data) // axios는 response.data로 JSON 데이터에 접근
      .catch((error) => {
        console.error(error);
        throw error; // 에러를 다시 throw하여 상위에서 처리할 수 있도록 함
      });

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
    const response = await axiosInstance
      .get(`/elders/${userId}`)
      .then((response) => response.data)
      .catch((error) => {
        console.error(error);
        throw error; // 에러를 상위로 전파하여 처리할 수 있도록 함
      });

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
      // localStorage에 저장
      localStorage.setItem(`fixedAssignments_${userId}`, JSON.stringify(filteredAssignments));
    } else {
      const filteredAssignments = await fixedAssignments.filter(
        (assignment) =>
          assignment.sequence !== fixedAssignment.sequence ||
          assignment.employee_id !== fixedAssignment.employee_id
      );

      const updatedAssignments = [...filteredAssignments, fixedAssignment];
      await setFixedAssignments(updatedAssignments);
      // localStorage에 저장
      localStorage.setItem(`fixedAssignments_${userId}`, JSON.stringify(updatedAssignments));
      await setLoadingSpinner(false);
    }
  }

  const handleDeleteEmployee = async (id) => {
    setLoadingSpinner(true);

    try {
      await axiosInstance.delete(`/employee/${id}`);

      setEmployees((prevEmployees) =>
        prevEmployees.filter((employee) => employee.id !== id)
      );

      if (selectedEmployeeIds.includes(id)) {
        setSelectedEmployeeIds(
          selectedEmployeeIds.filter((employeeId) => employeeId !== id)
        );
      }

      await toast.success("직원 삭제에 성공하였습니다.");
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast.error("직원 삭제에 실패하였습니다.");
    } finally {
      setLoadingSpinner(false);
    }
  };

  const handleDeleteElder = async (id) => {
    setLoadingSpinner(true);

    try {
      await axiosInstance.delete(`/elder/${id}`);

      setElders((prevElders) => prevElders.filter((elder) => elder.id !== id));

      if (selectedElderIds.includes(id)) {
        setSelectedElderIds(
          selectedElderIds.filter((elderId) => elderId !== id)
        );
      }

      await toast.success("어르신 삭제에 성공하였습니다.");
    } catch (error) {
      console.error("Error deleting elder:", error);
      toast.error("어르신 삭제에 실패하였습니다.");
    } finally {
      setLoadingSpinner(false);
    }
  };
  const handleDeleteCouple = async (id) => {
    setLoadingSpinner(true);

    try {
      await axiosInstance.delete(`/couple/${id}`);

      setCouples((prevCouples) =>
        prevCouples.filter((couple) => couple.coupleId !== id)
      );

      await toast.success("부부 어르신 삭제에 성공하였습니다.");
    } catch (error) {
      console.error("Error deleting couple:", error);
      toast.error("부부 어르신 삭제에 실패하였습니다.");
    } finally {
      setLoadingSpinner(false);
    }
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
    setCoupleFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
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
    setLoadingSpinner(true);
    e.preventDefault();

    try {
      await axiosInstance.post(`/employee/${userId}`, formData);

      setEmployees(await fetchEmployees());
      await toast.success("직원 추가에 성공하였습니다.");

      setFormData({
        name: "",
        workPlace: company.addressName,
        homeAddress: "",
        isDriver: false,
      });

      closeAddEmployeeModal();
    } catch (error) {
      console.error("There was an error adding the employee!", error);
      toast.error("직원 추가에 실패하였습니다.");
    } finally {
      setLoadingSpinner(false);
    }
  };

  const updateCouples = async () => {
    const newCouples = await fetchCouples();
    setCouples((prevCouples) => newCouples);
  };

  const handleCoupleSubmit = async (e) => {
    setLoadingSpinner(true);
    e.preventDefault();

    if (!coupleFormData.elderId1 || !coupleFormData.elderId2) {
      alert("두 명의 어르신을 모두 선택해주세요.");
      setLoadingSpinner(false);
      return;
    }

    try {
      await axiosInstance.post(`/couple/${userId}`, coupleFormData);

      await toast.success("부부 어르신 추가에 성공하였습니다.");
      setCouples(await fetchCouples());

      setCoupleFormData({
        elderId1: "",
        elderId2: "",
      });

      closeAddEmployeeModal();
    } catch (error) {
      console.error("There was an error adding the couple!", error);
      toast.error("부부 어르신 추가에 실패하였습니다.");
    } finally {
      setLoadingSpinner(false);
    }
  };

  const handleElderSubmit = async (e) => {
    setLoadingSpinner(true);
    e.preventDefault();

    try {
      await axiosInstance.post(`/elder/${userId}`, elderFormData);

      setElders(await fetchElders());
      await toast.success("어르신 추가에 성공하였습니다.");

      setElderFormData({
        name: "",
        homeAddress: "",
        requiredFrontSeat: false,
      });

      closeAddElderModal();
    } catch (error) {
      console.error("There was an error adding the elder!", error);
      toast.error("어르신 추가에 실패하였습니다.");
    } finally {
      setLoadingSpinner(false);
    }
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
      const response = await axiosInstance.get("/history");

      const data = await response.data;

      setDispatchHistories(data.content);
      setTotalPages(data.totalPages);
      setCurrentPage(data.number);
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
      const response = await axiosInstance.get(`/history/${historyId}`);

      const data = await response.data;
      setHistoryDetail(data);
      setSelectedHistoryId(historyId);

      await setDispatchResult(data.assignments);
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
    totalPages,
    currentPage,
    onPageChange,
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
        <div className="flex-1 overflow-auto">
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

        {/* 페이지네이션 */}
        <div className="flex justify-center items-center space-x-2 py-4 mt-4 border-t border-gray-200">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className={`px-3 py-1 rounded-md ${
              currentPage === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
            }`}
          >
            이전
          </button>

          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => onPageChange(index)}
              className={`px-3 py-1 rounded-md ${
                currentPage === index
                  ? "bg-sky-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
              }`}
            >
              {index + 1}
            </button>
          ))}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            className={`px-3 py-1 rounded-md ${
              currentPage === totalPages - 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
            }`}
          >
            다음
          </button>
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
          <div className="p-4 md:p-8 bg-gray-50">
            <div className="mb-6">
              <div className="flex flex-row items-center justify-between py-4">
                <div className="flex flex-row items-center">
                  <h2 className="text-2xl font-bold text-gray-800">직원 목록</h2>
                  <div className="w-6"></div>
                  <button className="text-sm hover:underline text-blue-500 font-medium transition-colors">
                    현재 선택 인원 {selectedEmployeeIds.length}명 +
                  </button>
                  <div className="w-6"></div>
                  <span className="text-sm px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                    최대 배차 인원 &nbsp;
                    <strong>
                    {employees
                      .filter((employee) =>
                        selectedEmployeeIds.includes(employee.id)
                      )
                      .reduce((sum, employee) => {
                        // 그 외의 경우 원래 employee 객체의 값을 사용
                        return sum + (employee.maximumCapacity || 0);
                      }, 0)}
                    {""}명
                    </strong>
                  </span>
                </div>

                <div className="flex flex-row mr-1">
                  <div className="relative mr-4">
                    <input 
                      type="text" 
                      placeholder="이름 또는 주소 검색" 
                      value={employeeSearchTerm || ''}
                      onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                      className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-64 p-2.5 shadow-sm"
                    />
                    {employeeSearchTerm && (
                      <button 
                        onClick={() => setEmployeeSearchTerm('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <button
                    disabled={!jwt}
                    onClick={() =>
                      employees.length > 5
                        ? setIsEmployeeCollapsed(!isEmployeeCollapsed)
                        : null
                    }
                    className={`text-sm w-20 h-8 rounded-lg transition-all ${
                      jwt
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {isEmployeeCollapsed ? "늘리기" : "접기"}
                  </button>
                  <div className="w-4"></div>

                  <button
                    disabled={!jwt}
                    onClick={openAddEmployeeModal}
                    className={`text-sm w-20 h-8 rounded-lg transition-all ${
                      jwt
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    직원 추가
                  </button>
                  <div className="w-4"></div>

                  <button
                    disabled={!jwt}
                    onClick={() => setShowEmployeeExcelModal(true)}
                    className={`text-sm w-20 h-8 rounded-lg transition-all ${
                      jwt
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    엑셀 업로드
                  </button>
                </div>
              </div>

              <div
                className={`relative overflow-x-auto shadow-xl rounded-xl ${
                  isEmployeeCollapsed ? "h-80 overflow-y-scroll" : ""
                } bg-white border border-gray-100`}
              >
                <table className="w-full text-sm text-center rtl:text-right text-gray-600 table-auto">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
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
                        유형
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
                    {employees
                      .filter(employee => {
                        if (!employeeSearchTerm) return true;
                        
                        const searchTermLower = employeeSearchTerm.toLowerCase();
                        return (
                          (employee.name && employee.name.toLowerCase().includes(searchTermLower)) ||
                          (employee.homeAddressName && employee.homeAddressName.toLowerCase().includes(searchTermLower))
                        );
                      })
                      .map((row) => (
                        <tr key={row.id} className="hover:bg-blue-50 border-b border-gray-100 transition-colors">
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
                          <td className="px-6 py-4 font-medium">
                            {editingEmployeeId === row.id ? (
                              <input
                                value={editedEmployee.name}
                                onChange={(e) =>
                                  handleEmployeeInputChange(e, "name")
                                }
                                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 text-center shadow-sm"
                              />
                            ) : (
                              row.name
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {editingEmployeeId === row.id ? (
                              <select
                                value={editedEmployee.isDriver}
                                onChange={(e) =>
                                  handleEmployeeInputChange(e, "isDriver")
                                }
                                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 text-center shadow-sm"
                              >
                                <option value={false}>직원</option>
                                <option value={true}>운전원</option>
                              </select>
                            ) : (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.isDriver ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {row.isDriver ? "운전원" : "직원"}
                              </span>
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
                                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 text-center shadow-sm"
                              />
                            ) : (
                              <div className="max-w-xs truncate mx-auto">
                                {row.homeAddressName}
                              </div>
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
                                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 text-center shadow-sm"
                              />
                            ) : (
                              <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
                                {row.maximumCapacity}명
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            {editingEmployeeId === row.id ? (
                              <div className="flex justify-center space-x-2">
                                <button
                                  onClick={() => handleEmployeeEdit(row.id, "employee")}
                                  className="font-medium text-blue-600 hover:text-blue-800 transition-colors"
                                >
                                  완료
                                </button>
                                <button
                                  onClick={() => setEditingEmployeeId(null)}
                                  className="font-medium text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                  취소
                                </button>
                              </div>
                            ) : (
                              <div className="flex justify-center space-x-2">
                                <button
                                  onClick={() => {
                                    setEditingEmployeeId(row.id);
                                    setEditedEmployee({
                                      id: row.id,
                                      name: row.name,
                                      homeAddressName: row.homeAddressName,
                                      maximumCapacity: row.maximumCapacity,
                                      homeAddressLongitude: row.homeAddressLongitude,
                                      homeAddressLatitude: row.homeAddressLatitude,
                                      isDriver: row.isDriver,
                                    });
                                  }}
                                  className="font-medium text-blue-600 hover:text-blue-800 transition-colors"
                                >
                                  수정
                                </button>
                                <button
                                  onClick={() => handleDeleteEmployee(row.id)}
                                  className="font-medium text-red-600 hover:text-red-800 transition-colors"
                                >
                                  삭제
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    {employees.filter(employee => {
                      if (!employeeSearchTerm) return false; // 검색어가 없으면 '결과 없음' 메시지를 표시하지 않음
                      
                      const searchTermLower = employeeSearchTerm.toLowerCase();
                      return !(
                        (employee.name && employee.name.toLowerCase().includes(searchTermLower)) ||
                        (employee.homeAddressName && employee.homeAddressName.toLowerCase().includes(searchTermLower))
                      );
                    }).length === employees.length && (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                          검색 결과가 없습니다.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="h-10"></div>
            <div>
              <div className="flex flex-row items-center justify-between mb-4">
                <div className="flex flex-row items-center">
                  <h2 className="text-2xl font-bold text-gray-800">어르신 목록</h2>
                  <div className="w-6"></div>
                  <button className="text-sm hover:underline text-blue-500 font-medium transition-colors">
                    현재 선택 인원 {selectedElderIds.length}명 +
                  </button>
                  <div className="w-6"></div>
                  <span className="text-sm px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                    최대 배차 인원 &nbsp;
                    <strong>
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
                    </strong>
                  </span>
                  <div className="w-4"></div>

                  {maxDisaptchStatus === "over" ? (
                    <span className="flex items-center p-1.5 bg-amber-50 rounded-full border border-amber-100">
                      <ReportProblemIcon
                        style={{ color: "orange", fontSize: 20 }}
                      />
                    </span>
                  ) : (
                    <span className="flex items-center p-1.5 bg-green-50 rounded-full border border-green-100">
                      <CheckCircleIcon
                        style={{ color: "#4ade80", fontSize: 20 }}
                      />
                    </span>
                  )}
                </div>

                <div className="flex flex-row mr-1">
                  <div className="relative mr-4">
                    <input 
                      type="text" 
                      placeholder="이름 또는 주소 검색" 
                      value={elderSearchTerm || ''}
                      onChange={(e) => setElderSearchTerm(e.target.value)}
                      className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-64 p-2.5 shadow-sm"
                    />
                    {elderSearchTerm && (
                      <button 
                        onClick={() => setElderSearchTerm('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <button
                    disabled={!jwt}
                    onClick={() =>
                      elders.length > 5
                        ? setIsElderCollapsed(!isElderCollapsed)
                        : null
                    }
                    className={`text-sm w-20 h-8 rounded-lg transition-all ${
                      jwt
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {isElderCollapsed ? "늘리기" : "접기"}
                  </button>
                  <div className="w-4"></div>

                  <button
                    disabled={!jwt}
                    onClick={openAddElderModal}
                    className={`text-sm w-20 h-8 rounded-lg transition-all ${
                      jwt
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    어르신 추가
                  </button>
                  <div className="w-4"></div>

                  <button
                    disabled={!jwt}
                    onClick={() => setShowElderExcelModal(true)}
                    className={`text-sm w-20 h-8 rounded-lg transition-all ${
                      jwt
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    엑셀 업로드
                  </button>
                </div>
              </div>

              <div
                className={`relative overflow-x-auto shadow-md rounded-xl ${
                  isElderCollapsed ? "h-80 overflow-y-scroll" : ""
                }`}
              >
                <table className="w-full text-sm text-center rtl:text-right text-gray-600 table-auto">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
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
                    {elders
                      .filter(elder => {
                        if (!elderSearchTerm) return true;
                        
                        const searchTermLower = elderSearchTerm.toLowerCase();
                        return (
                          (elder.name && elder.name.toLowerCase().includes(searchTermLower)) ||
                          (elder.homeAddressName && elder.homeAddressName.toLowerCase().includes(searchTermLower))
                        );
                      })
                      .map((row) => (
                        <tr key={row.id} className={"hover:bg-blue-50 border-b border-gray-100 transition-colors"}>
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
                          <td className="px-6 py-4 font-medium">
                            {editingElderId === row.id ? (
                              <input
                                value={editedElder.name}
                                onChange={(e) =>
                                  handleElderInputChange(e, "name")
                                }
                                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 text-center shadow-sm"
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
                                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 text-center shadow-sm"
                              />
                            ) : (
                              <div className="max-w-xs truncate mx-auto">
                                {row.homeAddressName}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {editingElderId === row.id ? (
                              <select
                                value={editedElder.requiredFrontSeat}
                                onChange={(e) =>
                                  handleSelectChange(e, "requiredFrontSeat")
                                }
                                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 text-center shadow-sm"
                              >
                                <option value="true">필요</option>
                                <option value="false">필요 없음</option>
                              </select>
                            ) : (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.requiredFrontSeat ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                {row.requiredFrontSeat ? "필요" : "필요 없음"}
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex justify-center space-x-2">
                              {editingElderId === row.id ? (
                                <>
                                  <button
                                    onClick={() => handleElderEdit(row.id)}
                                    className="font-medium text-blue-600 hover:text-blue-800 transition-colors"
                                  >
                                    저장
                                  </button>
                                  <button
                                    onClick={() => setEditingElderId(null)}
                                    className="font-medium text-gray-500 hover:text-gray-700 transition-colors"
                                  >
                                    취소
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingElderId(row.id);
                                      setEditedElder({
                                        id: row.id,
                                        name: row.name,
                                        homeAddressName: row.homeAddressName,
                                        homeAddressLongitude: row.homeAddressLongitude,
                                        homeAddressLatitude: row.homeAddressLatitude,
                                        requiredFrontSeat: row.requiredFrontSeat,
                                      });
                                    }}
                                    className="font-medium text-blue-600 hover:text-blue-800 transition-colors"
                                  >
                                    수정
                                  </button>
                                  <button
                                    onClick={() => handleDeleteElder(row.id)}
                                    className="font-medium text-red-600 hover:text-red-800 transition-colors"
                                  >
                                    삭제
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    {elders.filter(elder => {
                      if (!elderSearchTerm) return false; // 검색어가 없으면 '결과 없음' 메시지를 표시하지 않음
                      
                      const searchTermLower = elderSearchTerm.toLowerCase();
                      return !(
                        (elder.name && elder.name.toLowerCase().includes(searchTermLower)) ||
                        (elder.homeAddressName && elder.homeAddressName.toLowerCase().includes(searchTermLower))
                      );
                    }).length === elders.length && (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                          검색 결과가 없습니다.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="h-10"></div>
            <div>
              <div className="flex flex-row items-center justify-between mb-4">
                <div className="flex flex-row items-center">
                  <h2 className="text-2xl font-bold text-gray-800">부부 어르신 목록</h2>
                </div>

                <div className="flex flex-row mr-1">
                  <button
                    disabled={!jwt}
                    onClick={() =>
                      couples.length > 5
                        ? setIsCoupleCollapsed(!isCoupleCollapsed)
                        : null
                    }
                    className={`text-sm w-20 h-8 rounded-lg transition-all ${
                      jwt
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {isCoupleCollapsed ? "늘리기" : "접기"}
                  </button>
                  <div className="w-4"></div>

                  <button
                    onClick={openAddCoupleModal}
                    className={`text-sm w-32 h-8 rounded-lg transition-all ${
                      jwt
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    부부 어르신 추가
                  </button>
                </div>
              </div>

              <div
                className={`relative overflow-x-auto shadow-xl rounded-xl ${
                  isCoupleCollapsed ? "h-80 overflow-y-scroll" : ""
                } bg-white border border-gray-100`}
              >
                <table className="w-full text-sm text-center rtl:text-right text-gray-600 table-auto">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
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
                  <tbody>
                  {couples.map((row) => (
                    <tr key={row.coupleId} className="hover:bg-blue-50 border-b border-gray-100 transition-colors">
                      <td className="px-6 py-4 font-medium">
                        {editingCoupleId === row.coupleId ? (
                          <select
                            value={
                              editedCouple.firstElderId === undefined
                                ? row.firstElderId
                                : editedCouple.firstElderId
                            }
                            onChange={(e) =>
                              handleCoupleInputChange(e, "firstElderId")
                            }
                            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 text-center shadow-sm"
                          >
                            <option value="">선택하세요</option>
                            {elders
                              .filter(
                                (elder) =>
                                  !couples.some(
                                    (couple) =>
                                      (couple.firstElderId === elder.id ||
                                        couple.secondElderId === elder.id) &&
                                      couple.coupleId !== row.coupleId
                                  )
                              )
                              .map((elder) => (
                                <option key={elder.id} value={elder.id}>
                                  {elder.name}
                                </option>
                              ))}
                          </select>
                        ) : (
                          row.firstElder?.name || "-"
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {editingCoupleId === row.coupleId ? (
                          <select
                            value={
                              editedCouple.secondElderId === undefined
                                ? row.secondElderId
                                : editedCouple.secondElderId
                            }
                            onChange={(e) =>
                              handleCoupleInputChange(e, "secondElderId")
                            }
                            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 text-center shadow-sm"
                          >
                            <option value="">선택하세요</option>
                            {elders
                              .filter(
                                (elder) =>
                                  !couples.some(
                                    (couple) =>
                                      (couple.firstElderId === elder.id ||
                                        couple.secondElderId === elder.id) &&
                                      couple.coupleId !== row.coupleId
                                  )
                              )
                              .map((elder) => (
                                <option key={elder.id} value={elder.id}>
                                  {elder.name}
                                </option>
                              ))}
                          </select>
                        ) : (
                          row.secondElder?.name || "-"
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-center space-x-2">
                          {editingCoupleId === row.coupleId ? (
                            <>
                              <button
                                onClick={() => handleCoupleEdit(row.coupleId)}
                                className="font-medium text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                저장
                              </button>
                              <button
                                onClick={() => setEditingCoupleId(null)}
                                className="font-medium text-gray-500 hover:text-gray-700 transition-colors"
                              >
                                취소
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingCoupleId(row.coupleId);
                                  setEditedCouple({
                                    coupleId: row.coupleId,
                                    firstElderId: row.firstElderId,
                                    secondElderId: row.secondElderId,
                                  });
                                }}
                                className="font-medium text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                수정
                              </button>
                              <button
                                onClick={() => handleDeleteCouple(row.coupleId)}
                                className="font-medium text-red-600 hover:text-red-800 transition-colors"
                              >
                                삭제
                              </button>
                            </>
                          )}
                        </div>
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
                  <text className="text-2xl font-bold">배치 고정</text>
                  <div className="w-6"></div>

                  <button className="text-sm hover:underline text-gray-400">
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
                        ? "bg-blue-600 text-white hover:bg-blue-700"
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
                <table className="w-full text-sm text-center rtl:text-right text-gray-600 table-auto">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
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
                      <tr key={employee.id} className="hover:bg-blue-50 border-b border-gray-100 transition-colors">
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
                className={`text-sm w-60 h-12 rounded-lg transition-all ${
                  jwt
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                출근 차량 배치
              </button>
              <div className="w-4"></div>
              <button
                disabled={!jwt}
                onClick={checkDispatchOutData}
                className={`text-sm w-60 h-12 rounded-lg transition-all ${
                  jwt
                    ? "bg-blue-600 text-white hover:bg-blue-700"
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
                  totalPages={totalPages}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                />
              ) : (
                <div className="h-full flex flex-col">
                  <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200 text-gray-500">
                    배치 기록이 없습니다
                  </div>
                  <div className="flex justify-center items-center space-x-2 py-4 mt-4 border-t border-gray-200">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={
                        currentPage === 0 || dispatchHistories.length === 0
                      }
                      className={`px-3 py-1 rounded-md ${
                        currentPage === 0 || dispatchHistories.length === 0
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                      }`}
                    >
                      이전
                    </button>

                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index}
                        onClick={() => handlePageChange(index)}
                        disabled={dispatchHistories.length === 0}
                        className={`px-3 py-1 rounded-md ${
                          dispatchHistories.length === 0
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : currentPage === index
                            ? "bg-sky-500 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={
                        currentPage === totalPages - 1 ||
                        dispatchHistories.length === 0
                      }
                      className={`px-3 py-1 rounded-md ${
                        currentPage === totalPages - 1 ||
                        dispatchHistories.length === 0
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                      }`}
                    >
                      다음
                    </button>
                  </div>
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
    if (progress >= 1 && progress <= 10) {
      return <div>거리 행렬 생성 중 ...</div>;
    } else if (progress > 10 && progress < 95) {
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
    } else if (progress >= 95) {
      return <div>최종 결과 생성 중 . . .</div>;
    }
  }

  const handleSignout = async () => {
    setShowLogoutModal(false); // 모달 닫기
    await setLoadingSpinner(true);

    // localStorage에서 fixedAssignments 삭제
    localStorage.removeItem(`fixedAssignments_${userId}`);

    navigate("/");
    setJwt("");
    setSubscriptionType("");
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

  // useEffect에서 localStorage에서 fixedAssignments 불러오기 추가
  // App 컴포넌트 내의 적절한 위치에 추가
  useEffect(() => {
    // 사용자가 로그인되어 있고 userId가 있을 때만 실행
    if (userId) {
      const savedFixedAssignments = localStorage.getItem(`fixedAssignments_${userId}`);
      if (savedFixedAssignments) {
        try {
          const parsedAssignments = JSON.parse(savedFixedAssignments);
          setFixedAssignments(parsedAssignments);
        } catch (error) {
          console.error("저장된 배치 고정 데이터를 불러오는데 실패했습니다:", error);
        }
      }
    }
  }, [userId]); // userId가 변경될 때만 실행

  return (
    <div className="App">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

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
              {jwt && (
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

                  {/* 구 독  뱃지 */}

                  {subscriptionType === "free" && (
                    <SubscriptionBadges subscriptionType="free" /> // 무료 체험
                  )}
                  {subscriptionType === "basicMonthly" && (
                    <SubscriptionBadges subscriptionType="basicMonthly" /> // 월간 Basic
                  )}
                  {subscriptionType === "basicYearly" && (
                    <SubscriptionBadges subscriptionType="basicYearly" /> // 연간 Basic
                  )}
                  {subscriptionType === "premiumMonthly" && (
                    <SubscriptionBadges subscriptionType="premiumMonthly" /> // 월간 Premium
                  )}
                  {subscriptionType === "premiumYearly" && (
                    <SubscriptionBadges subscriptionType="premiumYearly" /> // 연간 Premium
                  )}

                  {/* 내 정보 버튼 */}
                  <button
                    onClick={() => navigate("/my-profile")}
                    className="px-1.5 py-1.5 text-sm text-sky-100 hover:text-white rounded-full hover:bg-sky-600 transition-colors"
                  >
                    내 정보
                  </button>

                  <button
                    onClick={() => navigate("/help")}
                    className="px-1.5 py-1.5 text-sm text-sky-100 hover:text-white rounded-full hover:bg-sky-600 transition-colors"
                  >
                    도움말
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

              {!jwt && (
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
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Company Info */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-sky-100 mb-4">
                회사 정보
              </h3>
              <div className="space-y-2">
                <div className="flex items-center text-xs">
                  <span className="text-sky-300 w-20">회사명</span>
                  <span className="text-gray-300">silverithm</span>
                </div>
                <div className="flex items-center text-xs">
                  <span className="text-sky-300 w-20">대표자</span>
                  <span className="text-gray-300">김준형</span>
                </div>
                <div className="flex items-center text-xs">
                  <span className="text-sky-300 w-20">사업자등록번호</span>
                  <span className="text-gray-300">107-21-26475</span>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-sky-100 mb-4">
                연락처
              </h3>
              <div className="space-y-2">
                <div className="flex items-center text-xs">
                  <span className="text-sky-300 w-20">주소</span>
                  <span className="text-gray-300">
                    서울특별시 신림동 1547-10
                  </span>
                </div>
                <div className="flex items-center text-xs">
                  <span className="text-sky-300 w-20">이메일</span>
                  <span className="text-gray-300">ggprgrkjh@naver.com</span>
                </div>
                <div className="flex items-center text-xs">
                  <span className="text-sky-300 w-20">전화번호</span>
                  <span className="text-gray-300">010-4549-2094</span>
                </div>
              </div>
            </div>

            {/* Legal Info */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-sky-100 mb-4">
                법적 고지
              </h3>
              <div className="flex flex-col space-y-2">
                <a
                  onClick={() => openAgreement(AGREEMENT_LINKS.privacyPolicy)}
                  className="text-gray-300 hover:text-sky-300 duration-200 cursor-pointer text-xs"
                >
                  개인정보 처리방침
                </a>
                <a
                  onClick={() => openAgreement(AGREEMENT_LINKS.termsOfService)}
                  className="text-gray-300 hover:text-sky-300 duration-200 cursor-pointer text-xs"
                >
                  서비스 이용약관
                </a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-6 pt-4 border-t border-sky-800/30">
            <p className="text-center text-xs text-gray-400">
              &copy; {new Date().getFullYear()} silverithm. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      {loading && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-10 flex flex-col items-center animate-fadeIn">
            <ScaleLoader color="#0EA5E9" loading={loading} size={60} />

            <div className="mt-8 text-xl font-medium text-slate-900">
              {updateProgressStatus(progress)}
            </div>

            <div className="w-[600px] mt-8">
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-400 to-blue-500 transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-2 text-right text-sm font-medium text-slate-600">
                {progress}%
              </div>
            </div>
          </div>
        </div>
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
                min="1"
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

      <Modal
        show={showEmployeeExcelModal}
        onHide={() => setShowEmployeeExcelModal(false)}
        centered
        size="lg"
        className="modern-modal"
      >
        <Modal.Header
          closeButton
          className="bg-gradient-to-r from-sky-600 to-sky-400 text-white border-0"
        >
          <Modal.Title className="text-xl font-medium">
            직원 데이터 엑셀 업로드
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-5">
          <div className="mb-5">
            <p className="text-sm text-gray-600 mb-2 flex items-center">
              <svg
                className="w-4 h-4 mr-2 text-sky-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                ></path>
              </svg>
              올바른 형식으로 데이터를 업로드하려면 아래 예시 파일을 참고하세요:
            </p>
            <button
              onClick={() => getExampleExcel("employee")}
              className="text-sm bg-sky-50 text-sky-700 px-4 py-2 rounded-md border border-sky-100 hover:bg-sky-100 hover:border-sky-200 transition-colors shadow-sm flex items-center"
            >
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
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
              예시 데이터 다운로드
            </button>
          </div>

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
              dragActive
                ? "border-sky-400 bg-sky-50"
                : "border-gray-300 bg-gray-50"
            } hover:border-sky-400 hover:bg-sky-50`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragActive(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleExcelFile(e.dataTransfer.files[0], "employee");
              }
            }}
          >
            <div className="flex flex-col items-center">
              <svg
                className={`w-14 h-14 mb-3 ${
                  dragActive ? "text-sky-500" : "text-gray-400"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                ></path>
              </svg>
              <p className="text-gray-500 mb-3">파일을 드래그 앤 드롭하거나</p>
              <label
                htmlFor="employee-file-input"
                className="cursor-pointer text-sky-600 hover:text-sky-800 hover:underline transition-colors px-4 py-2 bg-white border border-sky-200 rounded-md shadow-sm"
              >
                파일 선택하기
              </label>
              <input
                id="employee-file-input"
                type="file"
                accept=".xlsx, .xls"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleExcelFile(e.target.files[0], "employee");
                  }
                }}
                className="hidden"
              />
              <p className="mt-3 text-xs text-gray-500">
                지원 파일: .xlsx, .xls
              </p>
            </div>
          </div>

          {employeeExcelPreviewData.length > 0 && (
            <div className="mt-5">
              <h5 className="font-medium text-gray-700 mb-2 flex items-center">
                <svg
                  className="w-4 h-4 mr-2 text-sky-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  ></path>
                </svg>
                미리보기:
              </h5>
              <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                <table className="table min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(employeeExcelPreviewData[0]).map(
                        (header) => (
                          <th
                            key={header}
                            className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {header}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {employeeExcelPreviewData.map((row, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        {Object.values(row).map((value, colIndex) => (
                          <td
                            key={colIndex}
                            className="px-4 py-2 whitespace-nowrap text-sm text-gray-700"
                          >
                            {value || "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-gray-50 border-t border-gray-100">
          <button
            className="text-sm bg-sky-600 text-white w-32 h-10 rounded-md hover:bg-sky-500 transition-colors shadow-sm"
            onClick={handleEmployeeExcelUpload}
          >
            업로드
          </button>
          <button
            className="text-sm bg-gray-200 text-gray-700 w-32 h-10 rounded-md hover:bg-gray-300 transition-colors ml-2"
            onClick={() => {
              setShowEmployeeExcelModal(false);
              setElderExcelPreviewData([]);
              setEmployeeExcelPreviewData([]);
            }}
          >
            닫기
          </button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showElderExcelModal}
        onHide={() => setShowElderExcelModal(false)}
        centered
        size="lg"
        className="modern-modal"
      >
        <Modal.Header
          closeButton
          className="bg-gradient-to-r from-sky-600 to-sky-400 text-white border-0"
        >
          <Modal.Title className="text-xl font-medium">
            어르신 데이터 엑셀 업로드
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-5">
          <div className="mb-5">
            <p className="text-sm text-gray-600 mb-2 flex items-center">
              <svg
                className="w-4 h-4 mr-2 text-sky-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                ></path>
              </svg>
              올바른 형식으로 데이터를 업로드하려면 아래 예시 파일을 참고하세요:
            </p>
            <button
              onClick={() => getExampleExcel("elder")}
              className="text-sm bg-sky-50 text-sky-700 px-4 py-2 rounded-md border border-sky-100 hover:bg-sky-100 hover:border-sky-200 transition-colors shadow-sm flex items-center"
            >
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
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
              예시 데이터 다운로드
            </button>
          </div>

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
              dragActive
                ? "border-sky-400 bg-sky-50"
                : "border-gray-300 bg-gray-50"
            } hover:border-sky-400 hover:bg-sky-50`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragActive(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleExcelFile(e.dataTransfer.files[0], "elder");
              }
            }}
          >
            <div className="flex flex-col items-center">
              <svg
                className={`w-14 h-14 mb-3 ${
                  dragActive ? "text-sky-500" : "text-gray-400"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                ></path>
              </svg>
              <p className="text-gray-500 mb-3">파일을 드래그 앤 드롭하거나</p>
              <label
                htmlFor="elder-file-input"
                className="cursor-pointer text-sky-600 hover:text-sky-800 hover:underline transition-colors px-4 py-2 bg-white border border-sky-200 rounded-md shadow-sm"
              >
                파일 선택하기
              </label>
              <input
                id="elder-file-input"
                type="file"
                accept=".xlsx, .xls"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleExcelFile(e.target.files[0], "elder");
                  }
                }}
                className="hidden"
              />
              <p className="mt-3 text-xs text-gray-500">
                지원 파일: .xlsx, .xls
              </p>
            </div>
          </div>

          {elderExcelPreviewData.length > 0 && (
            <div className="mt-5">
              <h5 className="font-medium text-gray-700 mb-2 flex items-center">
                <svg
                  className="w-4 h-4 mr-2 text-sky-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  ></path>
                </svg>
                미리보기:
              </h5>
              <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                <table className="table min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(elderExcelPreviewData[0]).map((header) => (
                        <th
                          key={header}
                          className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {elderExcelPreviewData.map((row, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        {Object.values(row).map((value, colIndex) => (
                          <td
                            key={colIndex}
                            className="px-4 py-2 whitespace-nowrap text-sm text-gray-700"
                          >
                            {value || "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-gray-50 border-t border-gray-100">
          <button
            className="text-sm bg-sky-600 text-white w-32 h-10 rounded-md hover:bg-sky-500 transition-colors shadow-sm"
            onClick={handleElderExcelUpload}
          >
            업로드
          </button>
          <button
            className="text-sm bg-gray-200 text-gray-700 w-32 h-10 rounded-md hover:bg-gray-300 transition-colors ml-2"
            onClick={() => {
              setShowElderExcelModal(false);
              setElderExcelPreviewData([]);
              setEmployeeExcelPreviewData([]);
            }}
          >
            닫기
          </button>
        </Modal.Footer>
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
      .filter((employee) => selectedEmployeeIds.includes(employee.id))
      .reduce((sum, employee) => sum + employee.maxCapacity, 0);

    // 선택된 어르신 수
    const selectedEldersCount = selectedElderIds.length;
    const selectedEmployeeCount = selectedEmployeeIds.length;

    // 엔터프라이즈 요금제가 아닐 경우에만 인원수 제한 체크
    if (
      subscriptionType !== "premiumMonthly" && 
      subscriptionType !== "premiumYearly" && 
      (
        (selectedEmployeeCount > 10 || selectedEldersCount > 30)
      )
    ) {
      subscriptionType === "free"
        ? toast.warn(
            "무료 체험판 요금제는 직원 10명, 어르신 30명까지 선택할 수 있습니다."
          )
        : toast.warn(
            "베이직 요금제는 직원 10명, 어르신 30명까지 선택할 수 있습니다."
          );

      return;
    }

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
      .filter((employee) => selectedEmployeeIds.includes(employee.id))
      .reduce((sum, employee) => sum + employee.maxCapacity, 0);

    // 선택된 어르신 수
    const selectedEldersCount = selectedElderIds.length;
    const selectedEmployeeCount = selectedEmployeeIds.length;

    // 엔터프라이즈 요금제가 아닐 경우에만 인원수 제한 체크
    if (
      subscriptionType !== "premiumMonthly" && 
      subscriptionType !== "premiumYearly" && 
      (
        (selectedEmployeeCount > 10 || selectedEldersCount > 30)
      )
    ) {
      subscriptionType === "free"
        ? toast.warn(
            "무료 체험판 요금제는 직원 10명, 어르신 30명까지 선택할 수 있습니다."
          )
        : toast.warn(
            "베이직 요금제는 직원 10명, 어르신 30명까지 선택할 수 있습니다."
          );

      return;
    }

    if (selectedEldersCount > totalEmployeeCapacity) {
      toast.warn("선택된 어르신 수가 직원들의 최대 수용 인원을 초과했습니다.");
      return;
    }

    if (selectedEmployeeCount > selectedEldersCount) {
      toast.warn("선택된 어르신 수는 직원들의 수보다 적을 수 없습니다.");
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

    const eventSource = new EventSourcePolyfill(url, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    eventSource.addEventListener("sse", (event) => {
      if (!event.data.includes("EventStream Created")) {
        setProgress(Number(event.data));
      }

      if (event.data.includes("일일 제한을 초과")) {
        eventSource.close();
      }
    });

    eventSource.addEventListener("dispatch", (event) => {
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

    try {
      const result = await axiosInstance.post("/dispatch", requestData, {
        timeout: 600000, // 10분 타임아웃
      });

      if (result.status >= 200 && result.status < 300) {
        getProgressSSE(result.data);
      }

      if (
        result.status === 400 ||
        result.status === 401 ||
        result.status === 500
      ) {
        toast.error(result.data);
        setLoading(false);
      }
    } catch (error) {
      console.error("Dispatch error:", error);
      toast.error(error.response.data);
      setLoading(false);
    }
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

    try {
      const result = await axiosInstance.post("/dispatch", requestData, {
        timeout: 600000,
      });

      if (result.status >= 200 && result.status < 300) {
        getProgressSSE(result.data);
      }

      if (
        result.status === 400 ||
        result.status === 401 ||
        result.status === 500
      ) {
        toast.error(result.data);
        setLoading(false);
      }
    } catch (error) {
      console.error("Dispatch error:", error);
      toast.error(error.response.data);
      setLoading(false);
    }
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

    const [activeEmployeeId, setActiveEmployeeId] = useState(null);

    const handleEmployeeSelect = (employeeId) => {
      setActiveEmployeeId((prev) => {
        const newId = prev === employeeId ? null : employeeId;
        return newId;
      });
    };

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
    }, [map, dispatchData, activeEmployeeId]); // dispatchData가 변경될 때마다 지도 업데이트

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
    }, [map, dispatchData, activeEmployeeId]);

    const firstResult = dispatchData?.[0];
    const isSingleRoute = firstResult?.isSingleRoute || false;

    const handleDragEnd = async (result) => {
      if (!result.destination) return;

      const { source, destination } = result;
      const sourceDroppableId = parseInt(source.droppableId);
      const destDroppableId = parseInt(destination.droppableId);

      // 깊은 복사로 새로운 배열 생성
      const newDispatchResult = JSON.parse(JSON.stringify(dispatchData));

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

      // // 상태 업데이트
      // setDispatchResult(newDispatchResult);
      setDispatchData(newDispatchResult);

      // 지도의 기존 오버레이 제거
      if (map) {
        mapOverlays.forEach((overlay) => {
          overlay.setMap(null);
        });
        setMapOverlays([]);
      }
    };

    // 호출방식의 URL을 입력합니다.
    const url = "https://apis-navi.kakaomobility.com/v1/waypoints/directions";
    const MAX_WAYPOINTS = 5; // 카카오 API 경유지 제한

    async function calculateRouteInChunks(origin, destination, waypoints) {
      let totalDuration = 0;
      let currentOrigin = { ...origin };

      // waypoints를 5개씩 나누어 처리
      for (let i = 0; i < waypoints.length; i += MAX_WAYPOINTS) {
        // 현재 청크의 경유지들
        const chunkWaypoints = waypoints.slice(
          i,
          Math.min(i + MAX_WAYPOINTS, waypoints.length)
        );

        // 다음 시작점 결정
        const nextStartIndex = i + MAX_WAYPOINTS;
        const chunkDestination =
          nextStartIndex >= waypoints.length
            ? destination
            : waypoints[nextStartIndex];

        try {
          // 현재 청크의 경유지들을 문자열로 변환
          const waypointsStr = chunkWaypoints
            .map((point) => `${point.longitude},${point.latitude}`)
            .join("|");

          const params = new URLSearchParams({
            origin: `${currentOrigin.longitude},${currentOrigin.latitude}`,
            destination: `${chunkDestination.longitude},${chunkDestination.latitude}`,
            departure_time: "202501311800",
          });

          if (waypointsStr) {
            params.append("waypoints", waypointsStr);
          }

          const response = await fetch(
            `https://apis-navi.kakaomobility.com/v1/future/directions?${params}`,
            {
              method: "GET",
              headers: {
                Authorization: `KakaoAK ${REST_API_KEY}`,
              },
            }
          );

          if (!response.ok) {
            const errorText = await response.text();
            console.error("API Error Response:", errorText);
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const data = await response.json();
          totalDuration += data.routes[0].summary.duration;

          // 다음 요청의 시작점을 현재 청크의 도착점으로 설정
          currentOrigin = chunkDestination;
        } catch (error) {
          console.error("Error in chunk calculation:", error);
          throw error;
        }
      }

      return totalDuration;
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

      mapOverlays.forEach((overlay) => {
        overlay.setMap(null);
      });
      setMapOverlays([]);

      for (const [index, result] of dispatchData.entries()) {
        if (
          activeEmployeeId === null ||
          activeEmployeeId === result.employeeId
        ) {
          // 캐시 키 생성
          const cacheKey = `${result.employeeId}-${result.assignmentElders
            .map((e) => e.id)
            .join("-")}`;
          const lineStyle = getLineStyle(index);
          newRandomColors.push(lineStyle.color);

          let origin,
            destination,
            waypoints = [];

          if (result.isSingleRoute) {
            origin = result.isDriver
              ? {
                  x: result.workPlace.longitude,
                  y: result.workPlace.latitude,
                  name: result.workPlaceName,
                  type: "출발",
                }
              : {
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
              const currentElder = result.assignmentElders[i];
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
            origin = result.isDriver
              ? {
                  x: result.workPlace.longitude,
                  y: result.workPlace.latitude,
                  name: "학교",
                  type: "출발",
                }
              : {
                  x: result.homeAddress.longitude,
                  y: result.homeAddress.latitude,
                  name: result.employeeName,
                  type: "출발",
                };

            for (let i = 0; i < result.assignmentElders.length; i++) {
              const currentElder = result.assignmentElders[i];
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
              const currentElder = result.assignmentElders[i];
              waypoints.push({
                x: currentElder.homeAddress.longitude,
                y: currentElder.homeAddress.latitude,
                name: currentElder.name,
                type: "경유",
              });
            }

            destination = result.isDriver
              ? {
                  x: result.workPlace.longitude,
                  y: result.workPlace.latitude,
                  name: "학교",
                  type: "도착",
                }
              : {
                  x: result.homeAddress.longitude,
                  y: result.homeAddress.latitude,
                  name: result.employeeName,
                  type: "도착",
                };
          }

          // 캐시된 데이터 확인
          let data;
          if (directionsCache[cacheKey] && !isSingleRoute) {
            data = directionsCache[cacheKey];
            dur[index] = data.routes[0].summary.duration;
          } else {
            try {
              if (waypoints && waypoints.length > 5) {
                let allSections = []; // 모든 section을 저장할 배열

                let totalDuration = 0;
                let currentOrigin = { ...origin };
                let remainingWaypoints = [...waypoints];

                while (remainingWaypoints.length > 0) {
                  // 현재 처리할 최대 5개의 waypoint 복사
                  const currentWaypoints = remainingWaypoints.slice(0, 5);
                  let currentDestination;
                  let numConsumed = 0; // 이번 요청에서 소비할 remainingWaypoints의 개수

                  if (remainingWaypoints.length <= 5) {
                    // 남은 waypoint가 5개 이하이면 최종 목적지 사용
                    currentDestination = destination;
                    numConsumed = remainingWaypoints.length;
                  } else {
                    // 남은 waypoint가 6개 이상인 경우 6번째 waypoint를 임시 목적지로 설정
                    currentDestination = remainingWaypoints[5];
                    // 만약 현재 구간의 origin과 임시 목적지가 동일하다면,
                    // 5개의 waypoint 중 마지막 것을 목적지로 사용하고 해당 waypoint는 API 호출 시 제거
                    if (
                      currentOrigin.x === currentDestination.x &&
                      currentOrigin.y === currentDestination.y
                    ) {
                      if (currentWaypoints.length > 0) {
                        currentDestination =
                          currentWaypoints[currentWaypoints.length - 1];
                        currentWaypoints.pop(); // 사용한 waypoint 제거
                      } else {
                        break;
                      }
                      // 이 경우에는 5개만 소비
                      numConsumed = 5;
                    } else {
                      // 정상적인 경우 6개 소비 (5개 waypoint + 1개 destination)
                      numConsumed = 6;
                    }
                  }

                  // API 호출을 위한 파라미터 설정
                  const params = new URLSearchParams();
                  params.append(
                    "origin",
                    `${currentOrigin.x},${currentOrigin.y}`
                  );
                  params.append(
                    "destination",
                    `${currentDestination.x},${currentDestination.y}`
                  );
                  params.append("departure_time", "202501311800");
                  params.append("alternatives", true);

                  if (currentWaypoints.length > 0) {
                    const waypointsStr = currentWaypoints
                      .map((wp) => `${wp.x},${wp.y}`)
                      .join("|");
                    params.append("waypoints", waypointsStr);
                  }

                  // API 요청
                  const response = await fetch(
                    `https://apis-navi.kakaomobility.com/v1/future/directions?${params}`,
                    {
                      method: "GET",
                      headers: {
                        Authorization: `KakaoAK ${REST_API_KEY}`,
                      },
                    }
                  );

                  if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                  }

                  const chunkData = await response.json();
                  totalDuration += chunkData.routes[0].summary.duration;
                  allSections = [
                    ...allSections,
                    ...chunkData.routes[0].sections,
                  ];

                  // 다음 반복을 위한 준비: 현재 목적지를 새 출발지로 지정하고,
                  // 소비한 waypoint 개수만큼 remainingWaypoints에서 제거
                  currentOrigin = currentDestination;
                  remainingWaypoints = remainingWaypoints.slice(numConsumed);
                }

                data = {
                  routes: [
                    {
                      summary: {
                        duration: totalDuration,
                      },
                      sections: allSections, // 모든 sections 포함
                    },
                  ],
                };
                directionsCache[cacheKey] = data;
                dur[index] = data.routes[0].summary.duration;
              } else {
                // 경유지가 5개 이하인 경우 단일 요청
                const waypointsStr = waypoints
                  .map((point) => `${point.x},${point.y}`)
                  .join("|");

                const params = new URLSearchParams({
                  origin: `${origin.x},${origin.y}`,
                  destination: `${destination.x},${destination.y}`,
                  departure_time: "202501311800",
                  alternatives: true,
                });

                if (waypointsStr) {
                  params.append("waypoints", waypointsStr);
                }

                const response = await fetch(
                  `https://apis-navi.kakaomobility.com/v1/future/directions?${params}`,
                  {
                    method: "GET",
                    headers: {
                      Authorization: `KakaoAK ${REST_API_KEY}`,
                    },
                  }
                );

                if (!response.ok) {
                  throw new Error(`HTTP error! Status: ${response.status}`);
                }

                data = await response.json();
                directionsCache[cacheKey] = data;
                dur[index] = data.routes[0].summary.duration;
              }
            } catch (error) {
              console.error("Error:", error);
              continue;
            }
          }

          data.routes[0].sections.forEach(async (section) => {
            const linePath = [];

            section.roads.forEach((road) => {
              for (let i = 0; i < road.vertexes.length; i += 2) {
                const latLng = new kakao.maps.LatLng(
                  road.vertexes[i + 1],
                  road.vertexes[i]
                );
                linePath.push(latLng);
              }
            });

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

      let totalDuration = 0; // 총 예상 소요 시간 초기화
      let validDurationsCount = 0; // 유효한 예상 소요 시간의 개수

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

          // 예상 소요 시간 추가
          const duration = durations[index]
            ? (durations[index] / 60).toFixed(0)
            : "계산중...";
          formattedText += `예상 소요 시간: 약 ${duration}분\n\n`;

          // 총 예상 소요 시간 계산
          if (durations[index]) {
            totalDuration += durations[index];
            validDurationsCount++;
          }

          return formattedText;
        })
        .join("");

      // 평균 예상 소요 시간 계산
      const averageDuration =
        validDurationsCount > 0
          ? (totalDuration / validDurationsCount / 60).toFixed(0)
          : 0;
      const averageDurationText = `평균 예상 소요 시간: 약 ${averageDuration}분\n\n`;

      return header + body + averageDurationText;
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
      <Modal {...props} fullscreen aria-labelledby="dispatch-result-modal">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="h-screen flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
              <div className="px-4 py-3 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    차량 배치 결과 {isInbound ? "- 출근" : "- 퇴근"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    출퇴근 시간 도로 혼잡도 반영
                  </p>
                </div>
                <button
                  onClick={handleModalClose}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-600"
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
            <div className="flex-1 overflow-auto">
              {/* Notice Box */}
              <div className="bg-blue-50 border-b border-blue-200 py-2 px-4">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-blue-500 flex-shrink-0"
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
                      카카오맵 미래 운행 정보 길찾기 API 기준 예상
                      운행시간입니다.
                    </span>
                    <span className="text-blue-800 ml-1">
                      실제 도로 혼잡도에 따라 ±10분 정도 차이날 수 있습니다.
                    </span>
                  </div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 h-[calc(100vh-165px)]">
                {/* Left Side - Map */}
                <div className="h-[calc(100vh-165px)] sticky top-0">
                  <Map
                    setMap={setMap}
                    map={map}
                    isSingleRoute={isSingleRoute}
                    employeeLongitude={firstResult?.homeAddress?.longitude}
                    employeeLatitude={firstResult?.homeAddress?.latitude}
                  />
                </div>

                {/* Right Side - Assignment Details */}
                <div className="bg-white border-l border-gray-200 overflow-y-auto">
                  <div className="p-4 space-y-2">
                    {dispatchData.map((item, dispatchIndex) => (
                      <div
                        key={`dispatch-${dispatchIndex}`}
                        className={`p-3 border rounded-lg transition-colors ${
                          activeEmployeeId === item.employeeId
                            ? "bg-blue-50 border-blue-200"
                            : "border-gray-200"
                        }`}
                      >
                        <div
                          className="flex items-start"
                          onClick={() => handleEmployeeSelect(item.employeeId)}
                        >
                          <div
                            key={item.employeeId}
                            className="flex-shrink-0 font-medium w-20"
                            style={{
                              color:
                                activeEmployeeId &&
                                activeEmployeeId !== item.employeeId
                                  ? "#D1D5DB"
                                  : randomColors[
                                      dispatchIndex % randomColors.length
                                    ],
                            }}
                          >
                            {item.employeeName}
                            {item.isDriver && (
                              <span className="inline-flex items-center text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                                운전원
                              </span>
                            )}
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
                                  className="flex flex-wrap gap-1.5 mb-2"
                                >
                                  {item.assignmentElders.map(
                                    (elder, elderIndex) => (
                                      <Draggable
                                        key={`elder-${elder.id || elderIndex}`}
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
                              {!(
                                activeEmployeeId &&
                                activeEmployeeId !== item.employeeId
                              ) && (
                                <>
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
                                  예상 소요시간:
                                  <span className="font-medium ml-1">
                                    {(() => {
                                      const cacheKey = `${
                                        item.employeeId
                                      }-${item.assignmentElders
                                        .map((e) => e.id)
                                        .join("-")}`;
                                      return directionsCache[cacheKey]
                                        ? `약 ${(
                                            directionsCache[cacheKey].routes[0]
                                              .summary.duration / 60
                                          ).toFixed(0)}분`
                                        : isNaN(durations[dispatchIndex])
                                        ? "계산중..."
                                        : `약 ${(
                                            durations[dispatchIndex] / 60
                                          ).toFixed(0)}분`;
                                    })()}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-white border-t border-gray-200 p-3">
              <div className="flex justify-end gap-2">
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
