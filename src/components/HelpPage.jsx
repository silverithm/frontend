import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronDown } from "lucide-react";
import { Modal } from "react-bootstrap";
const HelpPage = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("general");
  const [activeIndices, setActiveIndices] = useState({});

  const toggleAccordion = (category, index) => {
    setActiveIndices((prev) => ({
      ...prev,
      [`${category}-${index}`]: !prev[`${category}-${index}`],
    }));
  };

  const categories = {
    start: {
      name: "시작하기",
      faqs: [
        {
          question: "어떻게 시작하나요?",
          answer: "메인페이지에서 회원가입 후, 모든 서비스 이용이 가능합니다.",
        },
        {
          question: "회원가입은 어떻게 하나요?",
          answer:
            "메인 페이지에서 '시작하기' 버튼을 클릭하여 간단한 정보 입력으로 가입할 수 있습니다.",
        },
        {
          question: "차량 배치는 어떻게 진행하나요?",
          answer:
            "직원과 어르신 정보 등록 후 사용 가능합니다. 회원가입 시에 입력한 직장 주소를 기준으로 차량 운행표를 생성합니다.",
        },
        {
          question: "부부 어르신 목록은 무엇인가요?",
          answer: "같은 차량에 탑승하는 부부 어르신을 등록할 수 있습니다.",
        },
        {
          question: "배치 고정은 무엇인가요?",
          answer: "특정 어르신을 특정 직원에게 배치할 수 있습니다.",
        },
        {
          question: "앞자리 탑승 여부는 무엇인가요?",
          answer:
            "거동이 불편하여 앞자리에 탑승하는 어르신을 등록할 수 있습니다. 등록하신 어르신은 차량 배치 진행 시 한 직원에게 한 분만 배정됩니다.",
        },
        {
          question: "단일 경로 길 찾기는 무엇인가요?",
          answer:
            "단일 차량 운행 경로를 생성하고 관리할 수 있습니다. 지도에 일일이 경유지를 입력하지 않고도 경로와 시간을 빠르게 확인하고 수정할 수 있습니다",
        },
        {
          question: "이전 배치 보기는 무엇인가요?",
          answer:
            "이전 배치를 한 눈에 볼 수 있는 대시보드를 제공합니다. 과거 데이터를 기반으로 효율적인 차량 운행 경로를 확인할 수 있습니다. (무료 평가판은 사용 불가능합니다.)",
        },

        {
          question: "서비스 이용을 위한 최소 요구사항이 있나요?",
          answer: "웹 브라우저만 있으면 별도의 설치 없이 즉시 이용 가능합니다.",
        },
      ],
    },
    general: {
      name: "일반",
      faqs: [
        {
          question: "인공지능 차량 경로 최적화 서비스란 무엇인가요?",
          answer:
            "인공지능 차량 경로 최적화 서비스는 딥러닝 기반의 알고리즘을 사용하여 차량의 경로를 최적화하는 서비스입니다.",
        },
        {
          question: "서비스의 핵심 기능은 무엇인가요?",
          answer:
            "실시간 경로 최적화, 드래그 앤 드롭 수정, 단일 경로 찾기, 이전 배치 기록 조회 등이 핵심 기능입니다.",
        },
        {
          question: "어떤 기술이 사용되나요?",
          answer:
            "최신 딥러닝 알고리즘과 실시간 교통 데이터를 활용하여 최적의 경로를 제시합니다.",
        },
      ],
    },
    benefits: {
      name: "서비스 혜택",
      faqs: [
        {
          question: "이 서비스를 사용하면 어떤 이점이 있나요?",
          answer:
            "이 서비스를 사용하면 요양기관 차량 운행표 작성 시간과 비용을 절감할 수 있으며, 효율적인 차량 운영이 가능합니다.",
        },
        {
          question: "비용 절감 효과는 어느 정도인가요?",
          answer: "평균적으로 운영 비용의 20-30% 절감 효과가 있습니다.",
        },
        {
          question: "업무 효율성은 어떻게 개선되나요?",
          answer:
            "수기 경로 계획 대비 90% 이상의 시간 절약과 실시간 조정으로 즉각적인 대응이 가능합니다.",
        },
      ],
    },

    pricing: {
      name: "요금제",
      faqs: [
        {
          question: "요금제는 어떻게 되나요?",
          answer: "요금제는 무료 체험판과 월간, 연간 구독 옵션이 있습니다.",
        },
        {
          question: "무료 체험판은 어떤 기능을 제공하나요?",
          answer:
            "일간 경로 최적화 1회, 단일 경로 찾기 5회, 직원 10명, 어르신 30명까지 관리 가능합니다.",
        },
        {
          question: "구독 중 해지하면 환불이 가능한가요?",
          answer:
            "월간 구독은 익월 자동 해지되며, 연간 구독은 잔여 기간에 대해 환불이 어렵습니다.",
        },
      ],
    },
  };
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const contactInfo = {
    email: "ggprgrkjh2@gmail.com",
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center mb-12">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 mr-2" />
              뒤로가기
            </button>
          </div>

          <h1 className="text-3xl font-bold text-center text-blue-900 mb-12">
            도움말
          </h1>

          <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
            {Object.entries(categories).map(([key, category]) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`px-6 py-2 rounded-full whitespace-nowrap transition-colors ${
                  activeCategory === key
                    ? "bg-blue-600 text-white"
                    : "bg-white text-blue-600 hover:bg-blue-50"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {categories[activeCategory].faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm border border-blue-100"
              >
                <button
                  className="w-full px-6 py-4 flex justify-between items-center hover:bg-blue-50 transition-colors"
                  onClick={() => toggleAccordion(activeCategory, index)}
                >
                  <span className="font-medium text-left text-blue-900">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-blue-600 transform transition-transform ${
                      activeIndices[`${activeCategory}-${index}`]
                        ? "rotate-180"
                        : ""
                    }`}
                  />
                </button>
                {activeIndices[`${activeCategory}-${index}`] && (
                  <div className="px-6 py-4 border-t border-blue-100 bg-blue-50/30">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-blue-100 mt-12 pt-8 text-center">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">
            추가 문의사항이 있으신가요?
          </h2>
          <button
            onClick={handleShow}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-medium hover:opacity-90 transition-opacity shadow-lg"
          >
            1:1 문의하기
          </button>
        </div>
        <div className="h-6"></div>

        <Modal show={show} onHide={handleClose} centered>
          <Modal.Body className="p-8 bg-gradient-to-br from-blue-50 to-white rounded-xl">
            <div className="relative">
              <h3 className="text-2xl font-bold text-blue-900 mb-6 text-center">
                Contact Us
              </h3>
              <div className="space-y-6">
                <div className="transform hover:scale-102 transition-transform bg-white rounded-xl p-6 shadow-lg border border-blue-100">
                  <div className="flex flex-col space-y-2">
                    <span className="text-sm font-medium text-blue-400">
                      EMAIL
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-blue-900">
                        {contactInfo.email}
                      </span>
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(contactInfo.email)
                        }
                        className="text-blue-500 hover:text-blue-600 text-sm underline"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-full mt-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Close
              </button>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
};

export default HelpPage;
