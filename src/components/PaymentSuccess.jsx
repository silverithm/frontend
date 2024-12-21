import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const paymentKey = searchParams.get("paymentKey");
      const orderId = searchParams.get("orderId");
      const amount = searchParams.get("amount");
      const plan = decodeURIComponent(searchParams.get("plan"));
      const billing = decodeURIComponent(searchParams.get("billing"));

      console.log(searchParams);
      console.log(window.location.search);

      try {
        setTimeout(() => {
          console.log(plan.toString());
          console.log(billing.toString());
          navigate("/main");
        }, 3000);
        // }
      } catch (error) {
        console.error("Payment verification failed:", error);
      }
    };

    handlePaymentSuccess();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          결제가 완료되었습니다!
        </h2>
        <p className="text-gray-600 mb-8">
          구독이 성공적으로 활성화되었습니다. 잠시 후 대시보드로 이동합니다.
        </p>
        <div className="animate-pulse flex justify-center">
          <div className="w-2 h-2 bg-blue-600 rounded-full mx-1"></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full mx-1 animation-delay-200"></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full mx-1 animation-delay-400"></div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
