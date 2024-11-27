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

  return (
    <main className="snap-y snap-mandatory h-screen overflow-y-auto">
      {sections.map((section, index) => (
        <SectionComponent key={index} section={section} index={index} />
      ))}
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
