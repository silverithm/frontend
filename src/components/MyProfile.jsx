import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../store/useStore";
import { toast } from "react-toastify";

const MyProfile = () => {
  const navigate = useNavigate();
  const { userName, userEmail, company } = useStore();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    // API 호출 로직...
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
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

            {/* 비밀번호 변경 */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  비밀번호 변경
                </h2>
                <button
                  onClick={() => setIsChangingPassword(!isChangingPassword)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {isChangingPassword ? "취소" : "변경하기"}
                </button>
              </div>

              {isChangingPassword && (
                <form
                  onSubmit={handlePasswordChange}
                  className="bg-gray-50 rounded-lg p-4 space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      새 비밀번호
                    </label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      변경 완료
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
