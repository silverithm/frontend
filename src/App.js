import { useEffect, useState } from "react";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Form from "react-bootstrap/Form";
import { toast, ToastContainer } from "react-toastify";
import config from "./config";

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

  const [elders, setElders] = useState([]);
  const [employees, setEmployees] = useState([]);

  var jwt =
    "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0MTAxIiwiYXV0aCI6IlJPTEVfQURNSU4iLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzIyMDg2MzI4LCJleHAiOjE3MjIwODgxMjh9.dxzLNvUreMd7f6UkicFBHuTeLdoyM9o2nM3hfdkeFuU";
  var userId = "1";

  const fetchEmployeesAndElders = async () => {
    if (jwt === "") {
      toast(
        "불러오기를 하려면 로그인이 필요합니다. 먼저 로그인을 시도해 주세요."
      );
      return;
    }
    await fetchEmployees();
    await fetchElders();
  };

  useEffect(() => {
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

    await setEmployees(response); // 상태 업데이트
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

    await setElders(response); // 상태 업데이트
  };

  const handleSelect = (employeeId, elderId, sequence) => {
    const selectedAssignment = {
      employee_id: employeeId === "없음" ? "없음" : Number(employeeId),
      elderly_id: elderId,
      sequence: sequence,
    };

    // onSelectAssignment(selectedAssignment);
  };

  const handleEdit = (id) => {
    // 수정 로직 추가
    console.log(`Edit row with id: ${id}`);
  };

  const handleDelete = (id) => {
    setRows(rows.filter((row) => row.id !== id));
  };

  const handleEmployeeCheckboxAll = () => {
    const checkboxes = document.querySelectorAll(
      'input[id^="employeeCheckbox"]'
    );
    const isChecked = checkboxes[0].checked;

    checkboxes.forEach((checkbox) => {
      if (checkbox.checked !== isChecked) {
        checkbox.checked = isChecked;
      }
    });
  };

  const handleElderCheckboxAll = () => {
    const checkboxes = document.querySelectorAll('input[id^="elderCheckbox"]');
    const isChecked = checkboxes[0].checked;

    checkboxes.forEach((checkbox) => {
      if (checkbox.checked !== isChecked) {
        checkbox.checked = isChecked;
      }
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="h-16 bg-sky-950	text-white flex flex-row place-items-center ">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4">
              <div className="flex-grow"></div>
              <text className="font-bold">SILVERITHM</text>
            </div>
            <div className="flex items-center space-x-4">
              <text className="font-bold text-sm">
                test101님 (진주숲속어르신학교) 환영합니다!
              </text>
              <button className="text-xs">로그인</button>
              <button className="text-xs">로그아웃</button>
              <button className="text-xs">회원가입</button>
              <div className="flex-grow"></div>
            </div>
          </div>
        </div>
      </header>
      <main>
        <div className="flex justify-end space-x-4 mt-2">
          <div className="flex flex-row space-x-4">
            <button onClick={() => setView("current")} className="text-base">
              차량 배치 진행하기
            </button>
            <button onClick={() => setView("previous")} className="text-base">
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
                  <button className="text-sm">현재 선택 인원 16명 +</button>
                  <div className="w-6"></div>
                  <text className="text-sm">최대 배차 인원 45명</text>
                </div>

                <div className="flex flex-row mr-1">
                  <button
                    onClick={() =>
                      employees.length > 5
                        ? setIsEmployeeCollapsed(!isEmployeeCollapsed)
                        : null
                    }
                    className="text-sm bg-sky-950 text-white w-20 h-8 rounded "
                  >
                    {isEmployeeCollapsed ? "늘리기" : "접기"}
                  </button>
                  <div className="w-4"></div>

                  <button className="text-sm bg-sky-950 text-white w-20 h-8 rounded ">
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
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            onChange={handleEmployeeCheckboxAll}
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
                        <td className="px-6 py-4">{row.address}</td>
                        <td className="px-6 py-4">{row.maxPeople}</td>

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
                  <button className="text-sm">현재 선택 인원 55명 +</button>
                  <div className="w-6"></div>
                  <text className="text-sm">최대 배차 인원 45명</text>
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
                    className="text-sm bg-sky-950 text-white w-20 h-8 rounded "
                  >
                    {isElderCollapsed ? "늘리기" : "접기"}
                  </button>
                  <div className="w-4"></div>

                  <button className="text-sm bg-sky-950 text-white w-20 h-8 rounded ">
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
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            onChange={handleElderCheckboxAll}
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
                        <td className="px-6 py-4">{row.address}</td>
                        <td className="px-6 py-4">{row.maxPeople}</td>

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

                  <button className="text-sm">현재 고정 인원 5명 +</button>
                  <div className="w-6"></div>
                  <button className="text-sm bg-sky-950 text-white w-20 h-8 rounded ">
                    고정 저장
                  </button>
                  <button className="text-sm bg-sky-950 text-white w-14 h-8 rounded ml-4">
                    고정 1
                  </button>
                  <button className="text-sm bg-sky-950 text-white w-14 h-8 rounded ml-4">
                    고정 2
                  </button>
                  <button className="text-sm bg-sky-950 text-white w-14 h-8 rounded ml-4">
                    고정 3
                  </button>
                </div>

                <div className="flex flex-row mr-1">
                  <button
                    onClick={() =>
                      employees.length > 5
                        ? setIsFixCollapsed(!isFixCollapsed)
                        : null
                    }
                    className="text-sm bg-sky-950 text-white w-20 h-8 rounded "
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
                      <th scope="col" className="p-4">
                        <div className="flex items-center">
                          <input
                            id="elderCheckbox-all"
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            onChange={handleElderCheckboxAll}
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
                        <td className="w-4 p-4">
                          <div className="flex items-center">
                            <input
                              id={`elderCheckbox-table-${employee.id}`}
                              type="checkbox"
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            />
                            <label
                              htmlFor={`checkbox-table-${employee.id}`}
                              className="sr-only"
                            >
                              checkbox
                            </label>
                          </div>
                        </td>
                        <td className="px-6 py-4">{employee.name}</td>
                        <td className="px-6 py-4">
                          {Array.from(
                            { length: employee.maximumCapacity },
                            (_, index) => (
                              <Form.Select
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
                              </Form.Select>
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
              <button className="text-sm bg-sky-950 text-white w-60 h-16 rounded-lg">
                출근 차량 배치
              </button>
              <div className="w-4"></div>
              <button className="text-sm bg-sky-950 text-white w-60 h-16 rounded-lg">
                퇴근 차량 배치
              </button>
            </div>
            <div className="h-10"></div>
          </div>
        ) : (
          <div>이전 배치 보기</div>
        )}
      </main>
    </div>
  );
}

export default App;
