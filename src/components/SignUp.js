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

  // 약관 링크 상수 정의
  const AGREEMENT_LINKS = {
    privacyPolicy:
      "https://plip.kr/pcc/d9017bf3-00dc-4f8f-b750-f7668e2b7bb7/consent/1.html", // 개인정보처리방침 URL
    termsOfService:
      " https://relic-baboon-412.notion.site/silverithm-13c766a8bb468082b91ddbd2dd6ce45d", // 서비스 이용약관 URL
  };

  // 약관 링크 열기 핸들러
  const openAgreement = (url) => {
    window.open(url, "_blank");
  };

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
    window.history.back();
  };

  const validateForm = () => {
    const newErrors = {};

    // 기존 필드 검증
    Object.keys(signUpData).forEach((key) => {
      const error = validateField(key, signUpData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });

    // 약관 동의 검증 추가
    if (!agreements.privacyPolicy) {
      newErrors.privacyPolicy = "개인정보 수집 및 이용에 동의해주세요.";
    }
    if (!agreements.termsOfService) {
      newErrors.termsOfService = "서비스 이용약관에 동의해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    await setLoadingSpinner(true);

    // 약관 동의 여부 확인
    if (!agreements.privacyPolicy || !agreements.termsOfService) {
      toast.error("필수 약관에 모두 동의해주세요.", {
        autoClose: 1000,
      });
      setLoadingSpinner(false);
      return;
    }

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
          toast.success(
            "회원가입에 성공했습니다. 로그인 페이지로 이동합니다.",
            {
              onClose: () => {
                navigate("/signin");
                setLoadingSpinner(false);
              },
              autoClose: 500,
            }
          );
        } else {
          const errorData = await response.json();
          toast.error(`회원가입 실패: 이메일 또는 데이터를 확인해 주세요.`, {
            autoClose: 1000,
          });
          setLoadingSpinner(false);
        }
      } catch (error) {
        toast.error("회원가입 중 오류가 발생했습니다.", {
          autoClose: 1000,
        });
        setLoadingSpinner(false);
      }
    } else {
      toast.error("입력 정보를 확인해주세요.", {
        autoClose: 1000,
      });
      setLoadingSpinner(false);
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
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-950 hover:bg-sky-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                회원가입
              </button>
              <button
                type="button"
                onClick={handleGoBack}
                className="mt-3 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-sky-950 hover:text-white hover:bg-gray-300 transition-all duration-200 focus:outline-none"
              >
                뒤로 가기
              </button>
            </div>
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
                    onClick={() => openAgreement(AGREEMENT_LINKS.privacyPolicy)}
                    className="text-sm text-indigo-600 hover:text-indigo-500 underline"
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
                    onClick={() =>
                      openAgreement(AGREEMENT_LINKS.termsOfService)
                    }
                    className="text-sm text-indigo-600 hover:text-indigo-500 underline"
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
    </div>
  );
}

export default SignUp;
