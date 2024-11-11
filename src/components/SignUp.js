import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import config from "../config";
import "react-toastify/dist/ReactToastify.css"; // CSS import 추가
import LoadingSpinnerOverlay from "./LoadingSpinner";

function SignUp() {
  const [LoadingSpinner, setLoadingSpinner] = useState(false);

  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    name: "",
    role: "ROLE_ADMIN",
    companyName: "",
    companyAddress: "",
  });
  const [errors, setErrors] = useState({});
  const [agreements, setAgreements] = useState({
    privacyPolicy: false,
    termsOfService: false,
  });
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);
  const navigate = useNavigate();

  // 주소 검색 팝업 열기
  const handleAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        // 팝업에서 검색결과 항목을 클릭했을때 실행할 코드를 작성하는 부분입니다.
        const addr = data.address; // 주소 가져오기

        // 주소 정보를 상태에 저장
        setSignUpData((prev) => ({
          ...prev,
          companyAddress: addr,
        }));

        // 주소가 입력되면 에러 메시지 제거
        setErrors((prev) => ({
          ...prev,
          companyAddress: "",
        }));
      },
    }).open();
  };
  const handleAgreementChange = (e) => {
    const { name, checked } = e.target;
    setAgreements((prev) => ({
      ...prev,
      [name]: checked,
    }));
    // 체크 시 에러 메시지 제거
    if (checked) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };
  const validateField = (name, value) => {
    switch (name) {
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value) ? "올바른 이메일 형식이 아닙니다." : "";
      case "password":
        return value.length < 8 ? "비밀번호는 최소 8자 이상이어야 합니다." : "";
      case "name":
        return value.trim() === "" ? "이름을 입력해주세요." : "";
      case "companyName":
        return value.trim() === "" ? "회사명을 입력해주세요." : "";
      case "companyAddress":
        return value.trim() === "" ? "회사 주소를 입력해주세요." : "";
      default:
        return "";
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(signUpData).forEach((key) => {
      const error = validateField(key, signUpData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    validateForm();
  }, []);

  const handleSignUpChange = (e) => {
    const { name, value } = e.target;
    setSignUpData((prev) => ({ ...prev, [name]: value }));

    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleGoBack = () => {
    navigate("/");
  };

  const handleSignUp = async (e) => {
    await setLoadingSpinner(true);
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await fetch(`${config.apiUrl}/signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(signUpData),
        });

        if (response.ok) {
          // Promise를 사용하여 toast가 표시된 후 페이지 이동
          toast.success("회원가입에 성공했습니다. 로그인 해주세요.", {
            onClose: () => {
              navigate("/signin");
              setLoadingSpinner(false);
            },
            autoClose: 500, // 2초 후 자동으로 닫힘
          });
        } else {
          const errorData = await response.json();
          toast.error(`회원가입 실패: 이메일 또는 데이터를 확인해 주세요.`, {
            autoClose: 500,
          });
          setLoadingSpinner(false);
        }
      } catch (error) {
        toast.error("회원가입 중 오류가 발생했습니다.", {
          autoClose: 500,
        });
      }
    } else {
      toast.error("입력 정보를 확인해주세요.", {
        autoClose: 500,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {LoadingSpinner && <LoadingSpinnerOverlay />}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          회원가입
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSignUp}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                이메일
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.email ? "border-red-300" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="이메일"
                  value={signUpData.email}
                  onChange={handleSignUpChange}
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                비밀번호
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.password ? "border-red-300" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="비밀번호"
                  value={signUpData.password}
                  onChange={handleSignUpChange}
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
            </div>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                이름
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.name ? "border-red-300" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="이름"
                  value={signUpData.name}
                  onChange={handleSignUpChange}
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="companyName"
                className="block text-sm font-medium text-gray-700"
              >
                회사명
              </label>
              <div className="mt-1">
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  required
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.companyName ? "border-red-300" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="회사명"
                  value={signUpData.companyName}
                  onChange={handleSignUpChange}
                />
                {errors.companyName && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.companyName}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="companyAddress"
                className="block text-sm font-medium text-gray-700"
              >
                회사 주소
              </label>
              <div className="mt-1">
                <input
                  id="companyAddress"
                  name="companyAddress"
                  type="text"
                  required
                  onClick={handleAddressSearch}
                  readOnly
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white cursor-pointer"
                  placeholder="클릭하여 주소 검색"
                  value={signUpData.companyAddress}
                />
                {errors.companyAddress && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.companyAddress}
                  </p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                회원가입
              </button>
              <button
                type="button"
                onClick={handleGoBack}
                className="mt-3 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                뒤로 가기
              </button>
            </div>
            {/* 약관 동의 섹션 추가 */}
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="privacyPolicy"
                    name="privacyPolicy"
                    type="checkbox"
                    checked={agreements.privacyPolicy}
                    onChange={handleAgreementChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 flex justify-between items-center w-full">
                  <label
                    htmlFor="privacyPolicy"
                    className="text-sm cursor-pointer"
                  >
                    개인정보 수집 및 이용 동의 (필수)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPrivacyPolicy(true)}
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    전체보기
                  </button>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="termsOfService"
                    name="termsOfService"
                    type="checkbox"
                    checked={agreements.termsOfService}
                    onChange={handleAgreementChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 flex justify-between items-center w-full">
                  <label
                    htmlFor="termsOfService"
                    className="text-sm cursor-pointer"
                  >
                    서비스 이용약관 동의 (필수)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowTermsOfService(true)}
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    전체보기
                  </button>
                </div>
              </div>
            </div>

            {/* ... 기존 버튼들 ... */}
          </form>
        </div>
      </div>

      {/* 개인정보 처리방침 모달 */}
      <dialog
        open={showPrivacyPolicy}
        onClose={() => setShowPrivacyPolicy(false)}
      >
        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <h3 className="text-lg font-medium text-gray-900">
            개인정보 수집 및 이용 동의
          </h3>
          <div className="mt-4 text-sm text-gray-500 max-h-96 overflow-y-auto">
            <p className="mb-4">
              회사는 다음과 같이 개인정보를 수집 및 이용합니다.
            </p>
            <h4 className="font-medium mb-2">1. 수집하는 개인정보 항목</h4>
            <ul className="list-disc pl-5 mb-4">
              <li>이메일 주소</li>
              <li>회사명</li>
              <li>회사 주소</li>
            </ul>
            {/* ... 추가 개인정보 처리방침 내용 ... */}
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
            onClick={() => setShowPrivacyPolicy(false)}
          >
            확인
          </button>
        </div>
      </dialog>

      {/* 이용약관 모달 */}
      <dialog
        open={showTermsOfService}
        onClose={() => setShowTermsOfService(false)}
      >
        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <h3 className="text-lg font-medium text-gray-900">서비스 이용약관</h3>
          <div className="mt-4 text-sm text-gray-500 max-h-96 overflow-y-auto">
            <p className="mb-4">
              본 약관은 서비스 이용에 관한 기본적인 사항을 규정합니다.
            </p>
            <h4 className="font-medium mb-2">제1조 (목적)</h4>
            <p className="mb-4">
              본 약관은 회사가 제공하는 서비스의 이용조건 및 절차, 회사와 회원
              간의 권리·의무 및 책임사항 등을 규정함을 목적으로 합니다.
            </p>
            {/* ... 추가 이용약관 내용 ... */}
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
            onClick={() => setShowTermsOfService(false)}
          >
            확인
          </button>
        </div>
      </dialog>
    </div>
  );
}

export default SignUp;
