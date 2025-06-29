import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Globe, Zap, Users, ArrowRight } from "lucide-react";
import { ScaleLoader } from "react-spinners";
import { toast } from "react-toastify";
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import RefundPolicyModal from "./RefundPolicyModal"; // 환불 정책 모달 가져오기
import RefundPolicyModalBottom from "./RefundPolicyModalBottom";
import useStore from "../store/useStore";
import config from "../config";
import { PRICE_PLANS } from "../constants/pricePlans";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "react-bootstrap/Modal";

const clientKey = config.payment_client_key;

const AGREEMENT_LINKS = {
  privacyPolicy:
    "https://plip.kr/pcc/d9017bf3-00dc-4f8f-b750-f7668e2b7bb7/privacy/1.html",
  termsOfService:
    "https://relic-baboon-412.notion.site/silverithm-13c766a8bb468082b91ddbd2dd6ce45d",
};

const LandingPage = () => {
  const navigate = useNavigate();
  const { isSignin, userName, userEmail, customerKey } = useStore();
  const [selectedBilling, setSelectedBilling] = useState("monthly");
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState(null);
  const [isRefundPolicyOpen, setIsRefundPolicyOpen] = useState(false);
  const [isRefundPolicyBottomOpen, setIsRefundPolicyBottomOpen] =
    useState(false);

  const [selectedPlanType, setSelectedPlanType] = useState(""); // 선택된 요금제 타입

    // 공지사항 팝업 관련 상태
    const [showNoticeModal, setShowNoticeModal] = useState(false);
    const [dontShowToday, setDontShowToday] = useState(false);

  var subscriptionType = "premiumYearly";

  useEffect(() => {
    // 공지사항 팝업 표시 여부 결정
    const checkNoticePopup = () => {
      const lastClosedDate = localStorage.getItem('noticePopupLastClosed');
      
      if (lastClosedDate) {
        // 오늘 날짜 구하기 (YYYY-MM-DD 형식)
        const today = new Date().toISOString().split('T')[0];
        
        // 마지막으로 닫은 날짜와 오늘 날짜 비교
        if (lastClosedDate === today) {
          // 오늘 이미 닫았으면 표시하지 않음
          return;
        }
      }
      
      // 그 외 경우에는 팝업 표시
      setShowNoticeModal(true);
    };
    
    // 페이지 로드 후 약간의 지연 시간을 두고 공지사항 표시 (UX 개선)
    const timer = setTimeout(() => {
      checkNoticePopup();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []); // 컴포넌트 마운트 시 한 번만 실행
  
  // 공지사항 팝업 닫기 함수
  const handleCloseNoticeModal = () => {
    if (dontShowToday) {
      // "오늘 하루 보지 않음" 체크되어 있으면 오늘 날짜 저장
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem('noticePopupLastClosed', today);
    }
    
    setShowNoticeModal(false);
    setDontShowToday(false); // 상태 초기화
  };

  useEffect(() => {
    async function fetchPayment() {
      try {
        const tossPayments = await loadTossPayments(clientKey);

        const payment = tossPayments.payment({
          customerKey,
        });

        setPayment(payment);
      } catch (error) {
        console.error("Error fetching payment:", error);
      }
    }
    fetchPayment();
  }, [clientKey, customerKey]);
  // ------ '카드 등록하기' 버튼 누르면 결제창 띄우기 ------
  // @docs https://docs.tosspayments.com/sdk/v2/js#paymentrequestpayment

  //http://localhost:3000/success?plan=%5Bobject%20Object%5D&customerKey=QbkYnhoH48ZxhTFnAHxNn&authKey=bln_WQJN41xe4ON
  async function requestBillingAuth(plan, selectedBilling) {
    const amount =
      selectedBilling === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;

    await payment.requestBillingAuth({
      method: "CARD",
      successUrl: `${window.location.origin}/success?plan=${encodeURIComponent(
        plan.englishName
      )}&billing=${encodeURIComponent(
        selectedBilling
      )}&amount=${encodeURIComponent(amount)}`,
      failUrl: `${window.location.origin}/fail?plan=${encodeURIComponent(
        plan.englishName
      )}&billing=${encodeURIComponent(
        selectedBilling
      )}&amount=${encodeURIComponent(amount)}`,
      customerEmail: userEmail,
      customerName: userName,
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

  // Hero 섹션에 사용할 애니메이션 변수
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };
  
  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
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
    <div className="bg-white">

        {/* 공지사항 팝업 모달 */}
        <Modal
        show={showNoticeModal}
        onHide={handleCloseNoticeModal}
        centered
        size="lg"
      >
        <div className="bg-white rounded-lg overflow-hidden relative">
          {/* 헤더 */}
          <div className="bg-gradient-to-r from-sky-600 to-blue-700 px-6 py-4">
            <h3 className="text-xl font-bold text-white flex items-center">
              <span className="bg-white text-blue-600 w-8 h-8 flex items-center justify-center rounded-full mr-2">
                📢
              </span>
              공지사항
            </h3>
          </div>
          
          {/* 본문 */}
          <div className="p-6">
            <div className="mb-6">
              {/* 서비스 종료 공지 */}
              <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-6">
                <h4 className="text-lg font-bold mb-3 text-red-800 flex items-center">
                  <span className="mr-2">⚠️</span>
                  실버리즘 서비스 종료 안내 (2025년 6월 29일)
                </h4>
                <div className="bg-white p-4 rounded-lg border border-red-100 mb-4">
                  <p className="text-red-700 font-semibold mb-2">📢 중요 공지</p>
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
                    <li><span className="font-medium text-red-600">서비스 종료일:</span> 2025년 6월 29일</li>
                    <li><span className="font-medium">종료 사유:</span> 서버 운영 비용 부담으로 인해 서비스 종료</li>
                                         <li><span className="font-medium">실버리즘은 요양기관 근무표 서비스 <a href="https://carev.netlify.app/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">케어브이</a>로 다시 찾아뵙도록 하겠습니다. </span> </li>
                    <li><span className="font-medium">그동안 실버리즘을 사용해 주신 전국의 요양기관 분들께 정말 감사드립니다.</span> </li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <p className="text-blue-700 font-semibold mb-2">💡 개별 서버 지원</p>
                  <p className="text-sm text-gray-700 mb-2">
                    서비스 종료 후에도 실버리즘을 이용하고 싶으신 분들을 위해<br/>
                    <span className="font-bold text-blue-600">이메일로 연락주신다면 따로 서버를 열어드립니다.</span>
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">연락처:</span> 
                    <a href="mailto:ggprgrkjh@naver.com" className="text-blue-600 underline ml-1">
                      ggprgrkjh@naver.com
                    </a>
                    <br/>
                  </p>
                </div>
              </div>

              <h4 className="text-lg font-bold mb-2 text-sky-800">실버리즘 차량 배차 시스템 업데이트 안내 (2025/05/16일)</h4>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                <p className="text-blue-700 font-semibold mb-2">🚀 기능 향상</p>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
                  <li><span className="font-medium">차량 배치 실행 버그 해결</span> - 차량 배치 실행 버그가 해결되었습니다.</li>
                  <li><span className="font-medium">배치 고정 기능 개선</span> - 새로고침 후에도 배치 고정 설정이 유지됩니다.</li>
                  <li><span className="font-medium">메인 UI 디자인 개선</span> - 더 직관적이고 보기 좋게 디자인이 개선되었습니다.</li>
                  <li><span className="font-medium">랜딩 페이지 UI 디자인 개선</span> - 메인 랜딩 페이지 UI UX가 개선되었습니다.</li>
                </ul>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-100 mb-6">
                <p className="text-green-700 font-semibold mb-2">📋 사용자 안내</p>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
                  <li>새롭게 개선된 기능들을 이용해보세요!</li>
                  <li>문의사항이 있으시면 <span className="text-blue-600">ggprgrkjh@naver.com</span>으로 연락주세요.</li>
                  <li>더 나은 서비스를 위해 항상 노력하겠습니다.</li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 mb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start">
                  <div className="flex-1 mr-4">
                    <div className="flex items-center mb-2">
                      <span className="bg-yellow-400 text-yellow-800 font-bold px-2 py-1 text-xs rounded-md mr-2 flex items-center justify-center">EVENT</span>
                      <p className="text-yellow-800 font-bold m-0 flex items-center">설문조사 참여하고 엔터프라이즈 이용권 받기!</p>
                    </div>
                    <p className="text-sm text-gray-700 mb-3 sm:mb-0">
                      실버리즘 서비스 개선을 위한 짧은 설문조사에 참여해주시면<br/>
                      <span className="font-bold text-red-500">무료 엔터프라이즈 30일 이용권</span>을 드립니다! (13,000원 상당)
                    </p>
                  </div>
                  <div className="flex justify-center items-center sm:self-center mt-3 sm:mt-0">
                    <a 
                      href="https://zrr.kr/e4xDuS" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="px-4 py-2 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-600 transition-colors shadow-sm flex items-center whitespace-nowrap no-underline"
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      설문조사 참여하기
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* 오늘 하루 보지 않기 체크박스 */}
            <div className="flex items-center mb-2">
              <input
                id="dontShowToday"
                type="checkbox"
                checked={dontShowToday}
                onChange={(e) => setDontShowToday(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="dontShowToday" className="ml-2 text-sm text-gray-600">
                오늘 하루 보지 않기
              </label>
            </div>
          </div>
          
          {/* 푸터 */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
            <button
              onClick={handleCloseNoticeModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              확인
            </button>
          </div>
          
          {/* 닫기 버튼 */}
          <button
            onClick={handleCloseNoticeModal}
            className="absolute top-4 right-4 text-white hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </Modal>
      {/* 모던한 히어로 섹션 - 유지 */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-900 via-blue-800 to-sky-700 text-white">
        {/* 배경 장식 요소 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-20">
            <svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="b" gradientTransform="rotate(150 .5 .5)">
                  <stop offset="0%" stopColor="#4FACFE"/>
                  <stop offset="100%" stopColor="#00F2FE"/>
                </linearGradient>
              </defs>
              <path d="M813.9 532.5c40.4-79 24.8-202.2-56.6-272-81.3-69.8-152-308.4-295-319.3C319.2-70.6 227 120 159.7 232.4c-67.5 112.4-162 171.7-115 292.6 47 120.8 215.4 88.4 328.4 137.3 113 48.9 123.7 273.3 246.4 237.4 122.8-36 154-288.1 194.4-367.2z" fill="url(#b)"/>
            </svg>
          </div>
        </div>

        <div className="container mx-auto px-6 py-24 relative z-10">
          <motion.div 
            className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[75vh]"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {/* 왼쪽 텍스트 콘텐츠 */}
            <div className="space-y-8">
              <motion.div
                variants={fadeIn}
                className="inline-block px-4 py-1 bg-sky-600/30 backdrop-blur-sm rounded-full text-sm font-medium text-sky-100 mb-2"
              >
                AI 기반 차량 운행 최적화 솔루션
              </motion.div>
              
              <motion.h1 
                variants={fadeIn}
                className="text-5xl md:text-6xl font-bold leading-tight"
              >
                차량 운행 계획을 <br/>
                <span className="text-sky-300">인공지능</span>으로 <br/>
                최적화하세요
              </motion.h1>
              
              <motion.p 
                variants={fadeIn}
                className="text-lg md:text-xl text-sky-100 leading-relaxed"
              >
                Silverithm은 요양기관의 차량 운행 계획을 AI로 최적화하여 시간과 비용을 절약해주는 혁신적인 서비스입니다.
              </motion.p>
              
              <motion.div 
                variants={fadeIn}
                className="flex flex-wrap gap-4"
              >
                <button
                  onClick={handleFreeStart}
                  className="px-8 py-4 bg-white text-sky-900 rounded-full font-bold hover:bg-sky-50 transition-colors flex items-center gap-2 shadow-lg"
                >
                  무료로 시작하기
                  <ArrowRight size={18} />
                </button>
                <a 
                  href="#features" 
                  className="px-8 py-4 bg-white text-sky-900 rounded-full font-bold hover:bg-sky-50 transition-colors flex items-center gap-2 shadow-lg no-underline"
                >
                  자세히 알아보기
                </a>
              </motion.div>
            </div>
            
            {/* 오른쪽 이미지/일러스트 영역 */}
            <motion.div 
              variants={fadeIn}
              className="relative hidden lg:block"
            >
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                {/* 3D 지도 또는 경로 최적화 일러스트레이션 이미지 */}
                <img 
                  src={`${process.env.PUBLIC_URL}/feature3.gif`} 
                  alt="AI 기반 경로 최적화" 
                  className="w-full h-full object-cover rounded-3xl shadow-2xl"
                />
                
                {/* 떠 있는 카드 요소들 */}
                <div className="absolute -bottom-6 -left-12 bg-white p-4 rounded-xl shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="bg-sky-100 p-2 rounded-lg">
                      <Zap className="w-6 h-6 text-sky-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">시간 절약</p>
                      <p className="text-sm font-bold text-gray-800">30% 빠른 배차</p>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -top-4 -right-8 bg-white p-4 rounded-xl shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="bg-sky-100 p-2 rounded-lg">
                      <Users className="w-6 h-6 text-sky-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">업무 효율 향상</p>
                      <p className="text-sm font-bold text-gray-800">97% 이상</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
          
          {/* 스크롤 다운 버튼 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="absolute bottom-8 left-0 right-0 flex justify-center"
          >
            <a 
              href="#features" 
              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors"
            >
              <ChevronDown className="w-5 h-5 text-white" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* 이전 버전으로 복구 - 섹션들 */}
      <main
        className="snap-y snap-mandatory h-screen overflow-y-auto "
        onScroll={handleScroll}
        id="features"
      >
        <RefundPolicyModal
          isOpen={isRefundPolicyOpen}
          onClose={() => setIsRefundPolicyOpen(false)}
          onAgree={handleAgree}
        />
        <RefundPolicyModalBottom
          isOpen={isRefundPolicyBottomOpen}
          onClose={() => setIsRefundPolicyBottomOpen(false)}
          onAgree={handleAgree}
        />
        
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
                  무료로 시작하기
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
                    <span className="ml-2 text-sm text-green-500">
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
                  ) : isSignin &&
                    ((subscriptionType === "basicMonthly" &&
                      selectedBilling === "monthly") ||
                      (subscriptionType === "basicYearly" &&
                        selectedBilling === "yearly")) ? (
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
                    <span className="ml-2 text-sm text-green-500">
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
                  ) : isSignin &&
                    ((subscriptionType === "premiumMonthly" &&
                      selectedBilling === "monthly") ||
                      (subscriptionType === "premiumYearly" &&
                        selectedBilling === "yearly")) ? (
                    "구독 중"
                  ) : (
                    "구독 시작하기"
                  )}
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 flex justify-between items-center px-2">
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-600">*</span>
                <span className="text-sm text-gray-600">
                  구독 서비스는 요금제에 따라 매월 또는 매년 자동 갱신되며, 별도의
                  해지 조치가 없는 한 정해진 구독 요금이 청구됩니다.
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
    </div>
  );
};

export default LandingPage;
