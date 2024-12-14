import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PaymentFail = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const errorCode = searchParams.get("code");
    const errorMessage = searchParams.get("message");

    // 에러 로깅
    console.error("Payment failed:", { errorCode, errorMessage });

    // 3초 후 랜딩 페이지로 이동
    const timer = setTimeout(() => {
      navigate("/");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-red-500"
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
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          결제에 실패했습니다
        </h2>
        <p className="text-gray-600 mb-8">
          죄송합니다. 결제 중 문제가 발생했습니다. 잠시 후 메인 페이지로
          이동합니다.
        </p>
        <div className="animate-pulse flex justify-center">
          <div className="w-2 h-2 bg-red-600 rounded-full mx-1"></div>
          <div className="w-2 h-2 bg-red-600 rounded-full mx-1 animation-delay-200"></div>
          <div className="w-2 h-2 bg-red-600 rounded-full mx-1 animation-delay-400"></div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFail;
