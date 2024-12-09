import React, { useState } from "react";
import { X } from "lucide-react";

const TermsPolicyModalBottom = ({ isOpen, onClose, onAgree }) => {
  const [isChecked, setIsChecked] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-blue-50 p-6 rounded-t-lg flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            서비스 이용약관
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-6">
            {/* 제1조 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                제1조 (목적)
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                본 약관은 실버리즘(이하 "회사")가 제공하는 서비스의 이용과
                관련하여 일정 기간 서비스 이용을 보장하는 회사의 정기 구독
                서비스(이하 "정기 구독 서비스")에 가입 및 결제한 회원(이하
                "구독자") 사이의 권리, 의무 및 책임사항, 기타 필요한 사항을
                규정하는 것을 목적으로 합니다.
              </p>
            </div>

            {/* 제2조 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                제2조 (용어의 정의)
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                본 약관에서 사용하는 주요 용어의 정의는 실버리즘 서비스
                이용약관을 따릅니다.
              </p>
            </div>

            {/* 제3조 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                제3조 (정기 구독 서비스 가입과 결제방식)
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                회원은 정기 구독 서비스에 가입하기 위하여 사이트 내 버튼을
                클릭하여 정기 구독 서비스 가입 화면인 "요금제 – 결제
                페이지"(이하 "요금제 안내 화면")에서 가입할 수 있습니다. 회원은
                계약기간을 선택하고 가입하기 버튼을 클릭함으로써 회사와 구독
                계약을 체결하게 되며, 구독자는 구매 시점에 제시된 가격으로
                구독자에게 계약기간 동안의 구독료를 청구하도록 허용합니다.
              </p>
            </div>

            {/* 제4조 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                제4조 (구독중 생성된 콘텐츠의 유효기간)
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                구독자가 구독 중 생성한 콘텐츠의 유효기간은 구독기간 내에
                한하며, 사용자의 구독 콘텐츠 이용 시 이를 고지합니다.
              </p>
            </div>

            {/* 제5조 ~ 제8조 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                제5조 (정기 구독 서비스 해지 방법)
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                구독자는 특별한 구독 해지 방법이 있지 아니하고, 구매한 구독기간
                만큼 구독서비스를 제공받을 수 있습니다.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                제6조 (구독 철회)
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                구독자는 구독 시작일 이후 정기 구독 서비스를 1회라도 사용했거나
                구독 시작일 이후 7일이 지난 경우 구독을 철회할 수 없습니다.
                (구독 환불은 고객센터, 취소는 홈페이지 내 구독 관리 페이지에서
                가능합니다.)
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                제7조 (구독제 변경 및 중단)
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                회사는 구독자의 구독 혜택을 유지하기 위해 합리적으로 운영을
                지속할 의무가 있습니다.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                제8조 (구독 요금)
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                "정기 구독 서비스"의 월 이용요금의 구체적인 내용은 (주)실버리즘
                홈페이지 내 게재하며, 구독 요금은 회사의 요금정책에 따라 변경될
                수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPolicyModalBottom;
