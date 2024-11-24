import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import useStore from "./store/useStore";
import "react-toastify/dist/ReactToastify.css";
import LoadingSpinnerOverlay from "./components/LoadingSpinner";
import FindModal from "./components/FindModal";

import config from "./config";
function Signin() {
  const navigate = useNavigate();
  const [LoadingSpinner, setLoadingSpinner] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showFindModal, setShowFindModal] = useState(false);
  const [findType, setFindType] = useState("email");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [findEmail, setFindEmail] = useState("");

  const {
    setCompany,
    setJwt,
    setUserId,
    setIsSignin,
    setUserEmail,
    setUserName,
  } = useStore();

  function handleBack() {
    navigate("/");
  }

  // 모달 닫기 함수
  const handleCloseModal = () => {
    setShowFindModal(false);
    resetModalForm();
  };
  const handleSignin = async (event) => {
    await setLoadingSpinner(true);
    console.log("submit!!!");
    event.preventDefault();
    console.log("submit!!!");
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      email: email,
      password: password,
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "manual",
    };

    await fetch(`${config.apiUrl}/signin`, requestOptions)
      .then((response) => response.json())
      .then(async (result) => {
        console.log(result);
        if (result.status !== 500) {
          toast.success("로그인에 성공하였습니다.", {
            onClose: () => {
              setLoadingSpinner(false);
              handleBack();
            },
            autoClose: 500, // 2초 후 자동으로 닫힘
          });
          await setJwt(result["tokenInfo"]["accessToken"]);
          await setCompany(
            result["companyName"],
            result["companyAddress"],
            result["companyAddressName"]
          );
          console.log(result["companyAddressName"]);
          await setUserId(result["userId"]);
          await setUserName(result["userName"]);
          await setUserEmail(email);
          await setIsSignin(true);
        } else {
          toast.error(
            "로그인에 실패하였습니다. 이메일 또는 비밀번호를 다시 확인해 주세요.",
            {
              onClose: () => {
                setLoadingSpinner(false);
              },
              autoClose: 1000,
            }
          );
          setLoadingSpinner(false);
        }

        return result;
      })
      .catch((error) => {
        toast.error("로그인에 실패하였습니다. 잠시 후 다시 시도해 주세요", {
          onClose: () => {
            setLoadingSpinner(false);
          },
          autoClose: 1000,
        });
        console.error(error);
        setLoadingSpinner(false);
      });
  };
  const [modalState, setModalState] = useState({
    show: false,
    email: "",
    verificationCode: "",
    isCodeSent: false,
    isVerified: false,
  });

  // 모달 초기화 함수
  const resetModalForm = () => {
    setModalState({
      show: false,
      email: "",
      verificationCode: "",
      isCodeSent: false,
      isVerified: false,
    });
  };

  // 인증번호 요청
  const requestVerificationCode = async () => {
    if (!modalState.email) {
      toast.error("이메일을 입력해주세요.");
      return;
    }

    setLoadingSpinner(true);
    try {
      const response = await fetch(`${config.apiUrl}/auth/send-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: modalState.email,
        }),
      });

      if (response.ok) {
        toast.success("인증번호가 이메일로 전송되었습니다.");
        setModalState((prev) => ({ ...prev, isCodeSent: true }));
      } else {
        toast.error("인증번호 전송에 실패했습니다.");
      }
    } catch (error) {
      toast.error("서버 오류가 발생했습니다.");
    } finally {
      setLoadingSpinner(false);
    }
  };

  // 인증번호 확인
  const verifyCode = async () => {
    if (!modalState.verificationCode) {
      toast.error("인증번호를 입력해주세요.");
      return;
    }

    setLoadingSpinner(true);
    try {
      const response = await fetch(`${config.apiUrl}/auth/verify-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: modalState.email,
          code: modalState.verificationCode,
        }),
      });

      if (response.ok) {
        toast.success(
          "인증이 완료되었습니다. 임시 비밀번호가 이메일로 전송되었습니다."
        );
        resetModalForm();
      } else {
        toast.error("인증번호가 일치하지 않습니다.");
      }
    } catch (error) {
      toast.error("서버 오류가 발생했습니다.");
    } finally {
      setLoadingSpinner(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-sky-950 to-blue-900 min-h-screen">
      <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8 ">
        <ToastContainer />
        {LoadingSpinner && <LoadingSpinnerOverlay />}
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-100">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form onSubmit={handleSignin} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-gray-100"
              >
                Email address
              </label>
              <div className="mt-2">
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  id="email"
                  name="email"
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-100"
                >
                  Password
                </label>

                <div className="text-sm">
                  <button
                    onClick={() =>
                      setModalState((prev) => ({ ...prev, show: true }))
                    }
                    className="font-semibold text-gray-100 hover:text-indigo-500"
                  >
                    비밀번호를 잊으셨나요?
                  </button>
                </div>
              </div>
              <div className="mt-2">
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <button className="flex w-full justify-center rounded-md  bg-sky-950 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                로그인
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm text-gray-300">
            회원이 아니신가요?
            <a
              href="/signup"
              className="ml-4 font-semibold leading-6 text-gray-300 hover:text-indigo-500"
            >
              회원가입
            </a>
            <a
              onClick={handleBack}
              className="ml-4 font-semibold leading-6 text-gray-300 hover:text-indigo-500"
            >
              돌아가기
            </a>
          </p>
        </div>
      </div>
      <FindModal
        modalState={modalState}
        setModalState={setModalState}
        resetModalForm={resetModalForm}
        requestVerificationCode={requestVerificationCode}
        verifyCode={verifyCode}
      />
    </div>
  );
}

export default Signin;
