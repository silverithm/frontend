export const PRICE_PLANS = {
  free: {
    name: "무료 체험판",
    englishName: "FREE",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "일간 경로 최적화 기능 5회",
      "무제한 단일 경로 찾기",
      "직원 최대 10명 선택",
      "어르신 최대 30명 선택",
    ],
  },
  basic: {
    name: "베이직",
    englishName: "BASIC",
    monthlyPrice: 9900,
    yearlyPrice: 95040,
    features: [
      "무제한 경로 최적화",
      "무제한 단일 경로 찾기",
      "직원 최대 10명 선택",
      "어르신 최대 30명 선택",
      "이전 배치 보기 대시보드",
    ],
  },
  enterprise: {
    name: "엔터프라이즈",
    englishName: "ENTERPRISE",
    monthlyPrice: 13000,
    yearlyPrice: 124800,
    features: [
      "모든 Basic 기능 포함",
      "무제한 직원 등록",
      "무제한 어르신 등록",
      "이전 배치 보기 대시보드",
    ],
  },
};
