import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../config";
import useStore from "../store/useStore";

const PaymentSuccess = () => {
  const navigate = useNavigate();

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

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      const searchParams = new URLSearchParams(window.location.search);

      const amount = decodeURIComponent(searchParams.get("amount"));
      const plan = decodeURIComponent(searchParams.get("plan"));
      const billing = decodeURIComponent(searchParams.get("billing"));
      const customerKey = decodeURIComponent(searchParams.get("customerKey"));
      const authKey = decodeURIComponent(searchParams.get("authKey"));
      const orderName = plan + "_" + billing;
      const customerEmail = userEmail;
      const customerName = userName;
      const taxFreeAmount = 0;

      try {
        await createSubscription(
          plan,
          amount,
          billing,
          customerKey,
          authKey,
          orderName,
          customerEmail,
          customerName,
          taxFreeAmount,
          jwt
        );
        setTimeout(() => {
          navigate("/main");
        }, 3000);
        // }
      } catch (error) {
        console.error("Payment verification failed:", error);
        navigate("/fail");
      }
    };

    handlePaymentSuccess();
  }, [navigate]);

  const createSubscription = async (
    plan,
    amount,
    billing,
    customerKey,
    authKey,
    orderName,
    customerEmail,
    customerName,
    taxFreeAmount,
    jwt
  ) => {
    try {
      const response = await axios.post(
        `${config.apiUrl}/subscriptions`,
        {
          planName: plan.toUpperCase(),
          billingType: billing.toUpperCase(),
          amount: amount,
          customerKey: customerKey,
          authKey: authKey,
          orderName: orderName,
          customerEmail: customerEmail,
          customerName: customerName,
          taxFreeAmount: taxFreeAmount,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("구독 생성 중 에러 발생:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      throw error;
    }
  };

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
