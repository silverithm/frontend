import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../store/useStore";
import { toast } from "react-toastify";
import axios from "axios";
import config from "../config";
import { ToastContainer } from "react-toastify";
import SubscriptionBadges from "./PricingModal";
import { AlertCircle } from "lucide-react";

const MyProfile = () => {
  const navigate = useNavigate();
  const { userName, userEmail, company, jwt } = useStore();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const subscriptionType = "premiumYearly";

  const [isLoading, setIsLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const validatePassword = (password) => {
    if (password.length < 8) {
      return "비밀번호는 최소 8자 이상이어야 합니다";
    }
    return "";
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    // 비밀번호 유효성 검사
    const newPasswordError = validatePassword(passwordForm.newPassword);
    if (newPasswordError) {
      setPasswordErrors((prev) => ({ ...prev, newPassword: newPasswordError }));
      return;
    }

    // 비밀번호 일치 검사
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordErrors((prev) => ({
        ...prev,
        confirmPassword: "새 비밀번호가 일치하지 않습니다",
      }));
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${config.apiUrl}/change/password`,
        {
          email: userEmail,
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("비밀번호가 성공적으로 변경되었습니다");
        setIsChangingPassword(false);
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setPasswordErrors({
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "비밀번호 변경에 실패했습니다"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${config.apiUrl}/cancel/subscription`,
        {
          email: userEmail,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("구독이 성공적으로 취소되었습니다.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "구독 취소에 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  const onCancelSubscription = () => {
    // setShowConfirmModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* 프로필 헤더 */}
          <div className="bg-gradient-to-r from-sky-950 to-blue-900 px-8 py-10">
            <div className="flex justify-between items-start">
              {" "}
              {/* justify-between 추가 */}
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                  <span className="text-3xl font-semibold text-blue-600">
                    {userName?.charAt(0)}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{userName}</h1>
                  <p className="text-blue-100 mt-1">{userEmail}</p>
                </div>
              </div>
              {/* 뒤로가기 버튼 */}
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                뒤로가기
              </button>
            </div>
          </div>

          {/* 프로필 정보 */}
          <div className="px-8 py-6 space-y-8">
            {/* 회사 정보 */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                회사 정보
              </h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <label className="text-sm text-gray-500">회사명</label>
                  <p className="text-gray-900 mt-1">{company.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">주소</label>
                  <p className="text-gray-900 mt-1">{company.addressName}</p>
                </div>
              </div>
            </div>
            {/* 현재 구독 정보 */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
                <span>현재 구독</span>
                {subscriptionType && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                    활성
                  </span>
                )}
              </h2>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900 mt-1">
                      {(
                        <SubscriptionBadges subscriptionType="premiumYearly" /> // 연간 Premium
                      ) ||
                        "구독이 없습니다"}
                    </p>
                  </div>
                  {subscriptionType && (
                    <button
                      onClick={handleCancelSubscription}
                      className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200 flex items-center gap-1.5"
                    >
                      <AlertCircle className="w-4 h-4" />
                      구독 관리
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 구독 취소 확인 모달 */}
            {showConfirmModal && (
              <div className="fixed inset-0 flex items-center justify-center z-50">
                <div
                  className="absolute inset-0 bg-black bg-opacity-50"
                  onClick={() => setShowConfirmModal(false)}
                />
                <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-center mb-2">
                    구독을 취소하시겠습니까?
                  </h3>
                  <p className="text-gray-500 text-sm text-center mb-6">
                    구독 취소 시 현재 구독 기간이 종료될 때까지 서비스를
                    이용하실 수 있습니다. 기간 종료 후에는 서비스 이용이
                    제한됩니다.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowConfirmModal(false)}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      돌아가기
                    </button>
                    <button
                      onClick={() => {
                        handleCancelSubscription();
                        setShowConfirmModal(false);
                      }}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      구독 취소
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* 비밀번호 변경 */}
            <div className="">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    비밀번호 변경
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    주기적인 비밀번호 변경을 통해 계정을 안전하게 보호하세요
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsChangingPassword(!isChangingPassword);
                    setPasswordForm({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                    setPasswordErrors({
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isChangingPassword
                      ? "text-gray-700 bg-gray-100 hover:bg-gray-200"
                      : "text-white bg-blue-600 hover:bg-blue-700"
                  }`}
                  disabled={isLoading}
                >
                  {isChangingPassword ? "취소" : "비밀번호 변경"}
                </button>
              </div>

              {isChangingPassword && (
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div className="space-y-4">
                    {/* 현재 비밀번호 입력 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        현재 비밀번호
                      </label>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            currentPassword: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="현재 비밀번호를 입력하세요"
                        disabled={isLoading}
                      />
                    </div>

                    {/* 새 비밀번호 입력 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        새 비밀번호
                      </label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => {
                          setPasswordForm((prev) => ({
                            ...prev,
                            newPassword: e.target.value,
                          }));
                          setPasswordErrors((prev) => ({
                            ...prev,
                            newPassword: validatePassword(e.target.value),
                          }));
                        }}
                        className={`w-full px-4 py-3 rounded-lg border transition-all ${
                          passwordErrors.newPassword
                            ? "border-red-300 focus:ring-red-500"
                            : "border-gray-300 focus:ring-blue-500"
                        } focus:ring-2 focus:border-transparent`}
                        placeholder="새 비밀번호를 입력하세요"
                        disabled={isLoading}
                      />
                      {passwordErrors.newPassword && (
                        <p className="mt-2 text-sm text-red-600">
                          {passwordErrors.newPassword}
                        </p>
                      )}
                    </div>

                    {/* 새 비밀번호 확인 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        새 비밀번호 확인
                      </label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            confirmPassword: e.target.value,
                          }))
                        }
                        className={`w-full px-4 py-3 rounded-lg border transition-all ${
                          passwordErrors.confirmPassword
                            ? "border-red-300 focus:ring-red-500"
                            : "border-gray-300 focus:ring-blue-500"
                        } focus:ring-2 focus:border-transparent`}
                        placeholder="새 비밀번호를 다시 입력하세요"
                        disabled={isLoading}
                      />
                      {passwordErrors.confirmPassword && (
                        <p className="mt-2 text-sm text-red-600">
                          {passwordErrors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 변경하기 버튼 */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-gray-400"
                      disabled={
                        isLoading ||
                        !passwordForm.currentPassword ||
                        !passwordForm.newPassword ||
                        !passwordForm.confirmPassword
                      }
                    >
                      {isLoading ? "변경 중..." : "변경하기"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
