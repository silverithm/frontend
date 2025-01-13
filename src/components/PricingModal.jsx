import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { ScaleLoader } from "react-spinners";
import { toast } from "react-toastify";
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import RefundPolicyModal from "./RefundPolicyModal";
import RefundPolicyModalBottom from "./RefundPolicyModalBottom";

import useStore from "../store/useStore";
const clientKey = "test_ck_d46qopOB89NoDMPaJzmO3ZmM75y0";
const customerKey = "QbkYnhoH48ZxhTFnAHxNn";
const PRICE_PLANS = {
  free: {
    name: "무료 체험판",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "일간 경로 최적화 기능 1회",
      "일간 단일 경로 찾기 5회",
      "직원 최대 10명 관리",
      "어르신 최대 30명 관리",
    ],
  },
  basic: {
    name: "베이직",
    monthlyPrice: 9900,
    yearlyPrice: 95040, // 9900 * 12 * 0.8 = 95040
    features: [
      "무제한 경로 최적화",
      "무제한 단일 경로 찾기",
      "직원 최대 10명 관리",
      "어르신 최대 30명 관리",
      "이전 배치 보기 대시보드",
    ],
  },
  enterprise: {
    name: "엔터프라이즈",
    monthlyPrice: 13000,
    yearlyPrice: 124800, // 13000 * 12 * 0.8 = 124800
    features: [
      "모든 Basic 기능 포함",
      "무제한 직원 등록",
      "무제한 어르신 등록",
      "이전 배치 보기 대시보드",
    ],
  },
};
const SubscriptionBadges = ({ subscriptionType }) => {
  const [show, setShow] = useState(false);
  const [isRefundPolicyOpen, setIsRefundPolicyOpen] = useState(false);
  const [selectedPlanType, setSelectedPlanType] = useState(""); // 선택된 요금제 타입
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const navigate = useNavigate();
  const { isSignin } = useStore();
  const [selectedBilling, setSelectedBilling] = useState("monthly");
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState(null);
  const [isRefundPolicyBottomOpen, setIsRefundPolicyBottomOpen] =
    useState(false);
  useEffect(() => {
    async function fetchPayment() {
      try {
        const tossPayments = await loadTossPayments(clientKey);
        // 회원 결제
        // @docs https://docs.tosspayments.com/sdk/v2/js#tosspaymentspayment
        const payment = tossPayments.payment({
          customerKey,
        });
        // 비회원 결제
        // const payment = tossPayments.payment({ customerKey: ANONYMOUS });
        setPayment(payment);
      } catch (error) {
        console.error("Error fetching payment:", error);
      }
    }
    fetchPayment();
  }, [clientKey, customerKey]);
  // ------ '카드 등록하기' 버튼 누르면 결제창 띄우기 ------
  // @docs https://docs.tosspayments.com/sdk/v2/js#paymentrequestpayment
  async function requestBillingAuth(plan, selectedBilling) {
    const amount =
      selectedBilling === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;

    await payment.requestBillingAuth({
      method: "CARD",
      successUrl: `${window.location.origin}/success?plan=${encodeURIComponent(
        plan.name
      )}&billing=${encodeURIComponent(
        selectedBilling
      )}&amount=${encodeURIComponent(amount)}`,
      failUrl: `${window.location.origin}/fail?plan=${encodeURIComponent(
        plan.name
      )}&billing=${encodeURIComponent(
        selectedBilling
      )}&amount=${encodeURIComponent(amount)}`,
      customerEmail: "customer123@gmail.com",
      customerName: "김토스",
    });
  }
  const formatPrice = (price) => {
    return new Intl.NumberFormat("ko-KR").format(price);
  };

  const handleSubscription = async (planType) => {
    if (!isSignin) {
      toast.info("로그인이 필요한 서비스입니다.");
      navigate("/signin", { state: { from: "/" } }); // 로그인 후 돌아올 경로 설정
      return;
    }

    setSelectedPlanType(planType);

    setIsRefundPolicyOpen(true);
  };

  const handleAgree = async () => {
    setIsRefundPolicyOpen(false);

    const plan = PRICE_PLANS[selectedPlanType];
    const price =
      selectedBilling === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;

    try {
      setLoading(true);
      // 결제 요청 로직 (주석 처리된 부분)
      // const response = await fetch(...);
      // const data = await response.json();
      // 결제 처리 로직
      requestBillingAuth(plan, selectedBilling);
    } catch (error) {
      console.error("Payment initiation failed:", error);
      toast.error("결제 초기화 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleFreeStart = () => {
    if (isSignin) {
      navigate("/main");
    } else {
      navigate("/signin");
    }
  };
  const badges = {
    free: (
      <span
        onClick={handleShow}
        className="ml-2 px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-600 rounded-full cursor-pointer"
      >
        무료 체험
      </span>
    ),
    basicMonthly: (
      <span
        onClick={handleShow}
        className="ml-2 px-2 py-0.5 text-xs font-semibold bg-gradient-to-r from-blue-400 to-purple-400 text-white rounded-full cursor-pointer"
      >
        월간 베이직
      </span>
    ),
    basicYearly: (
      <span
        onClick={handleShow}
        className="ml-2 px-2 py-0.5 text-xs font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full cursor-pointer"
      >
        연간 베이직
      </span>
    ),
    premiumMonthly: (
      <span
        onClick={handleShow}
        className="ml-2 px-2 py-0.5 text-xs font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full cursor-pointer"
      >
        월간 프리미엄 👑
      </span>
    ),
    premiumYearly: (
      <span
        onClick={handleShow}
        className="ml-2 px-2 py-0.5 text-xs font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full cursor-pointer"
      >
        연간 프리미엄 👑
      </span>
    ),
  };

  return (
    <>
      {badges[subscriptionType]}

      <Modal
        show={show}
        onHide={handleClose}
        size="xl"
        centered
        className="rounded-2xl"
      >
        <RefundPolicyModal
          isOpen={isRefundPolicyOpen}
          onClose={() => setIsRefundPolicyOpen(false)}
          onAgree={handleAgree}
          planType={selectedPlanType}
        />
        <RefundPolicyModalBottom
          isOpen={isRefundPolicyBottomOpen}
          onClose={() => setIsRefundPolicyBottomOpen(false)}
          onAgree={handleAgree}
        />
        <div className="bg-gray-50 py-12 px-4 md:px-6 lg:px-8 relative rounded-2xl">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              요금제
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-gray-600 mb-6">
              비즈니스 규모에 맞는 최적의 요금제를 선택하세요
            </p>

            {/* Billing Toggle */}
            <div className="flex justify-center items-center gap-3 md:gap-4">
              <span
                className={`text-sm whitespace-nowrap min-w-[60px] ${
                  selectedBilling === "monthly"
                    ? "text-blue-600 font-semibold"
                    : "text-gray-500"
                }`}
              >
                월간 구독
              </span>
              <button
                onClick={() =>
                  setSelectedBilling((prev) =>
                    prev === "monthly" ? "yearly" : "monthly"
                  )
                }
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 flex-shrink-0"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    selectedBilling === "yearly"
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
              <div
                className={`text-sm flex items-center whitespace-nowrap ${
                  selectedBilling === "yearly"
                    ? "text-blue-600 font-semibold"
                    : "text-gray-500"
                }`}
              >
                <span className="min-w-[60px]">연간 구독</span>
                <span className="ml-1 text-xs text-green-500 font-medium whitespace-nowrap">
                  (20% 할인)
                </span>
              </div>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Free Plan */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 flex flex-col">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {PRICE_PLANS.free.name}
                </h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">₩0</span>
                  <span className="text-gray-500">/월</span>
                </div>
                <ul className="mb-8 space-y-4 flex-grow">
                  {PRICE_PLANS.free.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <svg
                        className="w-5 h-5 text-green-500 mr-2"
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
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleFreeStart}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-colors"
                >
                  {subscriptionType === "free" ? "사용 중" : "무료로 시작하기"}
                </button>
              </div>

              {/* Basic Plan */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 flex flex-col">
                <div className="flex-row flex justify-between">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {PRICE_PLANS.basic.name}
                  </h3>
                  <h4 className="text-red-400">
                    {selectedBilling === "monthly" ? "30일" : "365일"}
                  </h4>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold">
                    ₩
                    {formatPrice(
                      selectedBilling === "monthly"
                        ? PRICE_PLANS.basic.monthlyPrice
                        : PRICE_PLANS.basic.yearlyPrice
                    )}
                  </span>
                  <span className="text-gray-500">
                    /{selectedBilling === "monthly" ? "월" : "년"}
                  </span>
                  {selectedBilling === "yearly" && (
                    <span className="ml-2 text-xs text-green-500">
                      (20% 할인)
                    </span>
                  )}
                </div>
                <ul className="mb-8 space-y-4 flex-grow">
                  {PRICE_PLANS.basic.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <svg
                        className="w-5 h-5 text-green-500 mr-2"
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
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSubscription("basic")}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-colors"
                  disabled={
                    loading ||
                    (subscriptionType === "basicMonthly" &&
                      selectedBilling === "monthly") ||
                    (subscriptionType === "basicYearly" &&
                      selectedBilling === "yearly")
                  }
                >
                  {loading ? (
                    <ScaleLoader color="#ffffff" height={15} />
                  ) : (subscriptionType === "basicMonthly" &&
                      selectedBilling === "monthly") ||
                    (subscriptionType === "basicYearly" &&
                      selectedBilling === "yearly") ? (
                    "구독 중"
                  ) : (
                    "구독 시작하기"
                  )}
                </button>
              </div>

              {/* Enterprise Plan */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-blue-500 flex flex-col relative transform scale-105">
                <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-sm font-medium rounded-bl-lg rounded-tr-xl">
                  인기
                </div>
                <div className="flex-row flex justify-between">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {PRICE_PLANS.enterprise.name}
                  </h3>
                  <h4 className="text-red-400">
                    {selectedBilling === "monthly" ? "30일" : "365일"}
                  </h4>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold">
                    ₩
                    {formatPrice(
                      selectedBilling === "monthly"
                        ? PRICE_PLANS.enterprise.monthlyPrice
                        : PRICE_PLANS.enterprise.yearlyPrice
                    )}
                  </span>
                  <span className="text-gray-500">
                    /{selectedBilling === "monthly" ? "월" : "년"}
                  </span>
                  {selectedBilling === "yearly" && (
                    <span className="ml-2 text-xs text-green-500">
                      (20% 할인)
                    </span>
                  )}
                </div>
                <ul className="mb-8 space-y-4 flex-grow">
                  {PRICE_PLANS.enterprise.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <svg
                        className="w-5 h-5 text-green-500 mr-2"
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
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSubscription("enterprise")}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-colors"
                  disabled={
                    loading ||
                    (subscriptionType === "premiumMonthly" &&
                      selectedBilling === "monthly") ||
                    (subscriptionType === "premiumYearly" &&
                      selectedBilling === "yearly")
                  }
                >
                  {loading ? (
                    <ScaleLoader color="#ffffff" height={15} />
                  ) : (subscriptionType === "premiumMonthly" &&
                      selectedBilling === "monthly") ||
                    (subscriptionType === "premiumYearly" &&
                      selectedBilling === "yearly") ? (
                    "구독 중"
                  ) : (
                    "구독 시작하기"
                  )}
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="col-span-3 mt-8">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-600">*</span>
                  <span className="text-sm text-gray-600">
                    위 상품의 최대 이용기간은 1년입니다.
                  </span>
                </div>
                <button
                  onClick={() => setIsRefundPolicyBottomOpen(true)}
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  환불 규정 안내
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SubscriptionBadges;
