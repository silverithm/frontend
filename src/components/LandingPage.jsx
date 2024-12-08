import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Globe, Zap, Users } from "lucide-react";
import { ScaleLoader } from "react-spinners";
import { toast } from "react-toastify";
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import RefundPolicyModal from "./RefundPolicyModal"; // 환불 정책 모달 가져오기

import useStore from "../store/useStore";
const clientKey = "test_ck_d46qopOB89NoDMPaJzmO3ZmM75y0";
const customerKey = "QbkYnhoH48ZxhTFnAHxNn";
const AGREEMENT_LINKS = {
  privacyPolicy:
    "https://plip.kr/pcc/d9017bf3-00dc-4f8f-b750-f7668e2b7bb7/privacy/1.html",
  termsOfService:
    "https://relic-baboon-412.notion.site/silverithm-13c766a8bb468082b91ddbd2dd6ce45d",
};

export const PRICE_PLANS = {
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
    name: "Basic",
    monthlyPrice: 13000,
    yearlyPrice: 124800, // 13,000 * 12 * 0.8 = 124,800
    features: [
      "무제한 경로 최적화",
      "무제한 단일 경로 찾기",
      "직원 최대 10명 관리",
      "어르신 최대 30명 관리",
      "이전 배치 보기 대시보드",
    ],
  },
  enterprise: {
    name: "Enterprise",
    monthlyPrice: 24900,
    yearlyPrice: 239040, // 24,900 * 12 * 0.8 = 239,040
    features: [
      "모든 Basic 기능 포함",
      "무제한 직원 등록",
      "무제한 어르신 등록",
      "이전 배치 보기 대시보드",
    ],
  },
};

const LandingPage = () => {
  const navigate = useNavigate();
  const { isSignin } = useStore();
  const [selectedBilling, setSelectedBilling] = useState("monthly");
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState(null);
  const [isRefundPolicyOpen, setIsRefundPolicyOpen] = useState(false);
  const [selectedPlanType, setSelectedPlanType] = useState(""); // 선택된 요금제 타입

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
  async function requestBillingAuth() {
    // 결제를 요청하기 전에 orderId, amount를 서버에 저장하세요.
    // 결제 과정에서 악의적으로 결제 금액이 바뀌는 것을 확인하는 용도입니다.
    await payment.requestBillingAuth({
      method: "CARD", // 자동결제(빌링)는 카드만 지원합니다
      successUrl: window.location.origin + "/success", // 요청이 성공하면 리다이렉트되는 URL
      failUrl: window.location.origin + "/fail", // 요청이 실패하면 리다이렉트되는 URL
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
      requestBillingAuth();
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

  const sections = [
    {
      title: "인공지능 차량 경로 최적화 서비스 silverithm",
      subtitle: "최적화된 경로, 최소화된 비용",
      icon: Zap,
      description:
        "딥러닝 기반의 실시간 최적화 알고리즘으로 효율적인 요양기관 차량 운영을 실현합니다.",
    },
    {
      title: "혁신적인 사용자 경험",
      subtitle: "직관적인 인터페이스로 손쉬운 관리",
      icon: Users,
      description:
        "복잡한 차량 운행표를 손쉽게, 누구나 전문가처럼 작성할 수 있습니다.",
    },
    {
      title: "미래를 선도하는 AI 물류 혁신",
      subtitle: "Silverithm이 만드는 새로운 물류의 기준",
      icon: Globe,
      description:
        "세계 최고 수준의 AI 기술로 물류의 새로운 패러다임을 제시합니다.",
    },
  ];

  const features = [
    {
      title: "실시간 경로 최적화",
      description:
        "AI가 데이터를 실시간으로 분석하여 차량 운행 최적의 경로를 제시합니다. 시간과 비용을 동시에 절감하세요.",
      gifSrc: `${process.env.PUBLIC_URL}/feature3.gif`,
      align: "right",
    },
    {
      title: "실시간 드래그 드랍 수정 기능",
      description:
        "실시간으로 경로를 수정하고, 드래그 드랍으로 경로를 쉽게 변경할 수 있습니다. 쉽고 간단하게 경로를 수정하세요.",
      gifSrc: `${process.env.PUBLIC_URL}/feature4.gif`,
      align: "left",
    },
    {
      title: "단일 경로 길 찾기",
      description:
        "간편하게 단일 차량 운행 경로를 생성하고 관리할 수 있습니다. 지도에 일일이 입력하지 말고 경로와 소요 시간을 빠르게 확인하세요.",
      gifSrc: `${process.env.PUBLIC_URL}/feature2.gif`,
      align: "right",
    },
    {
      title: "이전 배치 보기",
      description:
        "이전 배치를 한 눈에 볼 수 있는 대시보드를 제공합니다. 과거 데이터를 기반으로 효율적인 차량 운행 경로를 확인할 수 있습니다.",
      gifSrc: `${process.env.PUBLIC_URL}/feature1.gif`,
      align: "left",
    },
  ];

  const SectionComponent = ({ section, index }) => {
    const Icon = section.icon;
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          setIsVisible(entry.isIntersecting);
        },
        { threshold: 0.5 }
      );

      const sectionElement = document.getElementById(`section-${index}`);
      if (sectionElement) {
        observer.observe(sectionElement);
      }

      return () => observer.disconnect();
    }, []);

    return (
      <div
        id={`section-${index}`}
        className="min-h-screen flex items-center justify-center relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700" />
        <div
          className={`relative z-10 max-w-4xl mx-auto text-white text-center p-8 transition-all duration-1000
          ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
          }`}
        >
          <Icon className="w-16 h-16 mx-auto mb-8" />
          <h2 className="text-5xl font-bold mb-4">{section.title}</h2>
          <p className="text-xl mb-6">{section.subtitle}</p>
          <p className="text-lg max-w-2xl mx-auto mb-6">
            {section.description}
          </p>
        </div>
      </div>
    );
  };

  const FeatureSection = ({ feature, index }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          setIsVisible(entry.isIntersecting);
        },
        { threshold: 0.2 }
      );

      const featureElement = document.getElementById(`feature-${index}`);
      if (featureElement) {
        observer.observe(featureElement);
      }

      return () => observer.disconnect();
    }, []);

    return (
      <div
        id={`feature-${index}`}
        className={`flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto py-24 px-8
          ${feature.align === "left" ? "md:flex-row-reverse" : ""} 
          ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }
          transition-all duration-1000`}
      >
        <div className="md:w-1/2 mb-8 md:mb-0">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-1 rounded-2xl shadow-2xl">
            <img
              src={feature.gifSrc}
              alt={feature.title}
              className="rounded-2xl w-full"
            />
          </div>
        </div>
        <div
          className={`md:w-1/2 ${
            feature.align === "left" ? "md:pr-16" : "md:pl-16"
          }`}
        >
          <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {feature.title}
          </h3>
          <p className="text-lg text-gray-700 leading-relaxed">
            {feature.description}
          </p>
        </div>
      </div>
    );
  };
  const [isAtBottom, setIsAtBottom] = useState(false);

  const handleScroll = (e) => {
    const bottom =
      Math.abs(
        e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight
      ) < 1;
    setIsAtBottom(bottom);
  };

  const openAgreement = (url) => {
    window.open(url, "_blank");
  };

  return (
    <main
      className="snap-y snap-mandatory h-screen overflow-y-auto "
      onScroll={handleScroll}
    >
      <RefundPolicyModal
        isOpen={isRefundPolicyOpen}
        onClose={() => setIsRefundPolicyOpen(false)}
        onAgree={handleAgree}
      />
      {sections.map((section, index) => (
        <SectionComponent key={index} section={section} index={index} />
      ))}

      {features.map((feature, index) => (
        <FeatureSection key={index} feature={feature} index={index} />
      ))}

      <div className="bg-gray-50 py-24 px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            요금제
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            비즈니스 규모에 맞는 최적의 요금제를 선택하세요
          </p>

          {/* Billing Toggle */}
          <div className="flex justify-center items-center gap-4 mb-8">
            <span
              className={`text-sm ${
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
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  selectedBilling === "yearly"
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </button>
            <span
              className={`text-sm ${
                selectedBilling === "yearly"
                  ? "text-blue-600 font-semibold"
                  : "text-gray-500"
              }`}
            >
              연간 구독
              <span className="ml-1 text-xs text-green-500 font-medium">
                (20% 할인)
              </span>
            </span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
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
              무료로 시작하기
            </button>
          </div>

          {/* Basic Plan */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 flex flex-col">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {PRICE_PLANS.basic.name}
            </h3>
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
                <span className="ml-2 text-sm text-green-500">(20% 할인)</span>
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
              disabled={loading}
            >
              {loading ? (
                <ScaleLoader color="#ffffff" height={15} />
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
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {PRICE_PLANS.enterprise.name}
            </h3>
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
                <span className="ml-2 text-sm text-green-500">(20% 할인)</span>
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
              disabled={loading}
            >
              {loading ? (
                <ScaleLoader color="#ffffff" height={15} />
              ) : (
                "구독 시작하기"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
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

      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2">
        {isAtBottom ? (
          <button
            onClick={() => navigate("/main")}
            className="px-8 py-3 bg-white text-blue-600 rounded-full font-bold shadow-lg hover:bg-gray-100 transition-colors"
          >
            시작하기
          </button>
        ) : (
          <ChevronDown className="w-14 h-14 animate-bounce text-blue-800" />
        )}
      </div>
    </main>
  );
};

export default LandingPage;
