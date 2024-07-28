import { useEffect, useState } from "react";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Form from "react-bootstrap/Form";
import { toast, ToastContainer } from "react-toastify";
import config from "./config";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import useStore from "./store/useStore";
import Modal from "react-bootstrap/Modal";
import defaultKey from "../node_modules/uncontrollable/lib/esm/utils";
import Button from "react-bootstrap/Button";
import React from "react";
import { EventSourcePolyfill } from "event-source-polyfill";
import { styled } from "styled-components";
import ProgressBar from "react-bootstrap/ProgressBar";
import ScaleLoader from "react-spinners/ScaleLoader";

import "./styles/bootstrapcss.css";

const { kakao } = window;

const initialRows = [
  {
    id: 1,
    name: "John Doe",
    address: "경상남도 진주시 신안동 804번시 신안빌라 101호",
    maxPeople: 10,
  },
  {
    id: 2,
    name: "John Doe",
    address: "경상남도 진주시 신안동 804번시 신안빌라 101호",
    maxPeople: 10,
  },
  {
    id: 3,
    name: "John Doe",
    address: "경상남도 진주시 신안동 804번시 신안빌라 101호",
    maxPeople: 10,
  },
  {
    id: 4,
    name: "John Doe",
    address: "경상남도 진주시 신안동 804번시 신안빌라 101호",
    maxPeople: 10,
  },
  {
    id: 5,
    name: "John Doe",
    address: "경상남도 진주시 신안동 804번시 신안빌라 101호",
    maxPeople: 10,
  },

  {
    id: 6,
    name: "John Doe",
    address: "경상남도 진주시 신안동 804번시 신안빌라 101호",
    maxPeople: 10,
  },
  {
    id: 7,
    name: "John Doe",
    address: "경상남도 진주시 신안동 804번시 신안빌라 101호",
    maxPeople: 10,
  },
  {
    id: 8,
    name: "John Doe",
    address: "경상남도 진주시 신안동 804번시 신안빌라 101호",
    maxPeople: 10,
  },
  {
    id: 9,
    name: "John Doe",
    address: "경상남도 진주시 신안동 804번시 신안빌라 101호",
    maxPeople: 10,
  },
  {
    id: 10,
    name: "John Doe",
    address: "경상남도 진주시 신안동 804번시 신안빌라 101호",
    maxPeople: 10,
  },

  // 더 많은 데이터 추가 가능
];

function App() {
  const [rows, setRows] = useState(initialRows);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [view, setView] = useState("current"); // 'current' or 'previous'
  const [isEmployeeCollapsed, setIsEmployeeCollapsed] = useState(true);
  const [isElderCollapsed, setIsElderCollapsed] = useState(true);
  const [isFixCollapsed, setIsFixCollapsed] = useState(true);
  const [maxDisaptchStatus, setMaxDispatchStatus] = useState("under");
  const [fixedAssignments, setFixedAssignments] = useState([]);

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

  const handleSelectEmployee = (id) => {
    if (selectedEmployeeIds.includes(id)) {
      setSelectedEmployeeIds(
        selectedEmployeeIds.filter((employeeId) => employeeId !== id)
      );
    } else {
      setSelectedEmployeeIds([...selectedEmployeeIds, id]);
    }
    console.log(selectedEmployeeIds);
  };

  const handleSelectElder = (id) => {
    if (selectedElderIds.includes(id)) {
      setSelectedElderIds(selectedElderIds.filter((elderId) => elderId !== id));
    } else {
      setSelectedElderIds([...selectedElderIds, id]);
    }
    console.log(selectedElderIds);
  };

  const handleSelectAllEmployee = async () => {
    if (allEmployeeSelected) {
      console.log("1");
      await setSelectedEmployeeIds([]);
    } else {
      console.log("2");
      console.log(employees);
      await setSelectedEmployeeIds(
        await employees.map((employee) => employee.id)
      );
    }
    await setAllEmployeeSelected(!allEmployeeSelected);
    await console.log(selectedEmployeeIds);
  };

  const handleSelectAllElder = () => {
    if (allElderSelected) {
      setSelectedElderIds([]);
    } else {
      setSelectedElderIds(elders.map((elder) => elder.id));
    }
    setAllElderSelected(!allElderSelected);
  };

  useEffect(() => {
    const fetchEmployeesAndElders = async () => {
      if (jwt === "") {
        return;
      }
      var employees = await fetchEmployees();
      var elders = await fetchElders();

      await setEmployees(employees);
      await setElders(elders);
      await setSelectedEmployeeIds(employees.map((employee) => employee.id));
      await setSelectedElderIds(elders.map((elder) => elder.id));
    };

    fetchEmployeesAndElders();
  }, []);

  const fetchEmployees = async () => {
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

    console.log(response);

    return response;
  };
  const fetchElders = async () => {
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

    return response;
  };

  const handleSelect = (employeeId, elderId, sequence) => {
    const selectedAssignment = {
      employee_id: employeeId === "없음" ? "없음" : Number(employeeId),
      elderly_id: elderId,
      sequence: sequence,
    };

    setFixedCount((prev) => {
      return prev + 1;
    });

    onSelectAssignment(selectedAssignment);
  };

  async function onSelectAssignment(fixedAssignment) {
    if (fixedAssignment.elderly_id === "없음") {
      // '없음'을 선택했을 때는 해당 엘더의 모든 할당을 제거

      const filteredAssignments = await fixedAssignments.filter(
        (assignment) =>
          assignment.sequence !== fixedAssignment.sequence ||
          assignment.employee_id !== fixedAssignment.employee_id
      );
      await setFixedAssignments(filteredAssignments);
    } else {
      const filteredAssignments = await fixedAssignments.filter(
        (assignment) =>
          assignment.sequence !== fixedAssignment.sequence ||
          assignment.employee_id !== fixedAssignment.employee_id
      );
      await setFixedAssignments([...filteredAssignments, fixedAssignment]);
    }
  }

  const handleEdit = (id) => {
    // 수정 로직 추가
    console.log(`Edit row with id: ${id}`);
  };

  const handleDelete = (id) => {
    setRows(rows.filter((row) => row.id !== id));
  };

  // const handleEmployeeCheckboxAll = () => {
  //   const checkboxes = document.querySelectorAll(
  //     'input[id^="employeeCheckbox"]'
  //   );
  //   const isChecked = checkboxes[0].checked;

  //   checkboxes.forEach((checkbox) => {
  //     if (checkbox.checked !== isChecked) {
  //       checkbox.checked = isChecked;
  //     }
  //   });
  // };

  // const handleElderCheckboxAll = () => {
  //   const checkboxes = document.querySelectorAll('input[id^="elderCheckbox"]');
  //   const isChecked = checkboxes[0].checked;

  //   checkboxes.forEach((checkbox) => {
  //     if (checkbox.checked !== isChecked) {
  //       checkbox.checked = isChecked;
  //     }
  //   });
  // };

  const handleSignin = () => {
    navigate("/signin");
  };

  const handleSignout = () => {
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
              onClick={() => setView("previous")}
              className={`text-base hover:underline ${
                view === "current" ? "" : "underline"
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

                  <button className="text-sm bg-sky-950 text-white w-20 h-8 rounded hover:bg-sky-500">
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
                      <tr
                        key={row.id}
                        className={`${
                          selectedRows.has(row.id) ? "bg-blue-200" : ""
                        } hover:bg-blue-100`}
                      >
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
                        <td className="px-6 py-4">{row.name}</td>
                        <td className="px-6 py-4">{row.homeAddressName}</td>
                        <td className="px-6 py-4">{row.maximumCapacity}</td>

                        <td className="px-6 py-4">
                          {selectedRows.has(row.id) ? (
                            <button
                              onClick={() => handleEdit(row.id)}
                              className="mr-2 font-medium text-blue-600 dark:text-blue-500 hover:underline"
                            >
                              Complete
                            </button>
                          ) : (
                            <button
                              onClick={() => handleEdit(row.id)}
                              className="mr-2 font-medium text-blue-600 dark:text-blue-500 hover:underline"
                            >
                              수정
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(row.id)}
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

                  <button className="text-sm bg-sky-950 text-white w-20 h-8 rounded hover:bg-sky-500 ">
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
                      <tr
                        key={row.id}
                        className={`${
                          selectedRows.has(row.id) ? "bg-blue-200" : ""
                        } hover:bg-blue-100`}
                      >
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
                        <td className="px-6 py-4">{row.name}</td>
                        <td className="px-6 py-4">{row.homeAddressName}</td>
                        <td className="px-6 py-4">
                          {row.requiredFrontSeat === false
                            ? "필요 없음"
                            : "필요"}
                        </td>

                        <td className="px-6 py-4">
                          {selectedRows.has(row.id) ? (
                            <button
                              onClick={() => handleEdit(row.id)}
                              className="mr-2 font-medium text-blue-600 dark:text-blue-500 hover:underline"
                            >
                              Complete
                            </button>
                          ) : (
                            <button
                              onClick={() => handleEdit(row.id)}
                              className="mr-2 font-medium text-blue-600 dark:text-blue-500 hover:underline"
                            >
                              수정
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(row.id)}
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

                  <button className="text-sm hover:underline">
                    현재 고정 인원 {fixedCount}명 +
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
                    {employees.map((employee, index) => (
                      <tr
                        key={employee.id}
                        className={`${
                          selectedRows.has(index) ? "bg-blue-200" : ""
                        } hover:bg-blue-100`}
                      >
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
                                onChange={(e) =>
                                  handleSelect(
                                    employee.id,
                                    e.target.value,
                                    index + 1
                                  )
                                }
                              >
                                <option value="없음">없음</option>
                                {elders.map((elder, idx) => (
                                  <option key={idx} value={elder.id}>
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
          <div>이전 배치 보기 - 업데이트 예정</div>
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
        console.log(response);
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
        console.log(response.text);
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
