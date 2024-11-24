import React from "react";
import { Modal } from "react-bootstrap";

const FindModal = ({
  modalState,
  setModalState,
  resetModalForm,
  requestVerificationCode,
  verifyCode,
}) => {
  const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  };
  return (
    <Modal
      show={modalState.show}
      onHide={resetModalForm}
      centered
      dialogClassName="modal-90w" // 추가
    >
      <div className="bg-white rounded-lg shadow-xl w-full">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <h3 className="text-xl font-semibold text-white">비밀번호 찾기</h3>
          <p className="text-blue-100 text-sm mt-1">
            가입하신 이메일로 인증번호를 보내드립니다
          </p>
        </div>
        {/* 본문 */}
        <div className="p-6 space-y-6">
          {/* 이메일 입력 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              이메일 주소
            </label>
            <div className="flex gap-3">
              <input
                type="email"
                value={modalState.email}
                onChange={(e) =>
                  setModalState((prev) => ({ ...prev, email: e.target.value }))
                }
                disabled={modalState.isCodeSent}
                placeholder="example@email.com"
                className={`flex-1 rounded-lg border p-3 text-gray-600 placeholder-gray-400
                  ${
                    !isValidEmail(modalState.email) && modalState.email
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "hover:border-blue-400 focus:border-blue-500 focus:ring-blue-500"
                  }
                  ${modalState.isCodeSent ? "bg-gray-50" : ""}`}
              />
              {!modalState.isCodeSent && (
                <button
                  onClick={requestVerificationCode}
                  className="whitespace-nowrap bg-blue-500 text-white px-5 py-3 rounded-lg font-medium
                    hover:bg-blue-600 active:bg-blue-700 transition-colors
                    disabled:bg-gray-300 disabled:cursor-not-allowed"
                  disabled={!isValidEmail(modalState.email)}
                >
                  인증번호 받기
                </button>
              )}
            </div>
            {modalState.email && !isValidEmail(modalState.email) && (
              <p className="text-sm text-red-500 mt-1">
                올바른 이메일 형식이 아닙니다
              </p>
            )}
          </div>

          {/* 인증번호 입력 */}
          {modalState.isCodeSent && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                인증번호
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={modalState.verificationCode}
                  onChange={(e) =>
                    setModalState((prev) => ({
                      ...prev,
                      verificationCode: e.target.value,
                    }))
                  }
                  placeholder="6자리 인증번호 입력"
                  maxLength={6}
                  className="flex-1 rounded-lg border p-3 text-gray-600 placeholder-gray-400
                    hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={verifyCode}
                  className="whitespace-nowrap bg-blue-500 text-white px-5 py-3 rounded-lg font-medium
                    hover:bg-blue-600 active:bg-blue-700 transition-colors
                    disabled:bg-gray-300"
                  disabled={!modalState.verificationCode}
                >
                  인증 확인
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                이메일로 전송된 6자리 인증번호를 입력해주세요
              </p>
            </div>
          )}
        </div>
        {/* 푸터 */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg border-t">
          <div className="flex justify-end gap-3">
            <button
              onClick={resetModalForm}
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium
                hover:bg-gray-100 active:bg-gray-200 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default React.memo(FindModal);
