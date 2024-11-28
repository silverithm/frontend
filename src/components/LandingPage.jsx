import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Globe, Zap, Users } from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();
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
        "복잡한 차량 시간표를 손쉽게. 누구나 전문가처럼 작성할 수 있습니다.",
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
        "간편하게 단일 차량 운행 경로를 생성하고 관리할 수 있습니다. 지도에 일일이 입력하지 말고 경로와 시간을 빠르게 확인하세요.",
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

  return (
    <main className="snap-y snap-mandatory h-screen overflow-y-auto">
      {sections.map((section, index) => (
        <SectionComponent key={index} section={section} index={index} />
      ))}
      <div className="bg-white min-h-screen">
        <div className="pt-20 pb-8 text-center">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            강력한 기능을 경험해보세요
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Silverithm의 혁신적인 기능으로 물류 운영의 새로운 차원을 경험하세요
          </p>
        </div>
        {features.map((feature, index) => (
          <FeatureSection key={index} feature={feature} index={index} />
        ))}
      </div>
      <div className="bg-gray-50 py-24 px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            요금제
          </h2>
          <p className="text-xl text-gray-600">
            비즈니스 규모에 맞는 최적의 요금제를 선택하세요
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h3 className="text-2xl font-bold mb-4">무료 체험판</h3>
            <p className="text-4xl font-bold mb-6">
              ₩0<span className="text-lg text-gray-500 font-normal">/월</span>
            </p>
            <ul className="space-y-3 mb-8">
              <li>• 일간 경로 최적화 기능 1회 </li>
              <li>• 일간 단일 경로 찾기 5회</li>
              <li>• 직원 최대 10명 관리</li>
              <li>• 어르신 최대 30명 관리</li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-2xl shadow-lg text-white transform scale-105">
            <h3 className="text-2xl font-bold mb-4">월간 프리미엄 </h3>
            <p className="text-4xl font-bold mb-6">
              ₩12,900
              <span className="text-lg opacity-75 font-normal">/월</span>
            </p>
            <ul className="space-y-3 mb-8">
              <li>• 무제한 경로 최적화</li>
              <li>• 무제한 단일 경로 찾기</li>
              <li>• 인원 추가 무제한</li>
              <li>• 이전 배치 보기 대시보드</li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h3 className="text-2xl font-bold mb-4 flex items-center">
              연간 구독
              <span className="ml-2 text-red-500 font-bold text-sm">
                23% 특별 할인
              </span>
            </h3>
            <div className="relative mb-6">
              <p className="text-4xl font-bold">
                ₩99,000
                <span className="text-lg text-gray-500 font-normal">/년</span>
              </p>
            </div>
            <ul className="space-y-3 mb-8">
              <li>• 월간 프리미엄의 모든 기능</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2">
        <button
          onClick={() => navigate("/main")}
          className="px-8 py-3 bg-white text-blue-600 rounded-full font-bold shadow-lg hover:bg-gray-100 transition-colors"
        >
          시작하기
        </button>
      </div>
    </main>
  );
};

export default LandingPage;
