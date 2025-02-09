import axios from "axios";
import useStore from "../store/useStore";
import config from "../config";
import { toast } from "react-toastify";

const axiosInstance = axios.create({
  baseURL: `${config.apiUrl}`,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터
axiosInstance.interceptors.request.use(
  (config) => {
    const jwt = useStore.getState().jwt;
    if (jwt) {
      config.headers.Authorization = `Bearer ${jwt}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    console.log("Original request:", originalRequest);
    if (
      error.response?.status === 401 &&
      error.response?.data?.error === "Token expired" &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = useStore.getState().refreshToken;
        const response = await axios.post(`${config.apiUrl}/refresh-token`, {
          refreshToken: refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Zustand 스토어 업데이트
        useStore.setState({
          jwt: accessToken,
          refreshToken: newRefreshToken,
        });

        processQueue(null, accessToken);

        const newRequest = {
          ...originalRequest,
          headers: {
            ...originalRequest.headers,
            Authorization: `Bearer ${accessToken}`,
          },
        };

        const urlParams = new URLSearchParams(
          originalRequest.url.split("?")[1]
        );
        if (urlParams.toString()) {
          newRequest.params = {};
          for (const [key, value] of urlParams) {
            newRequest.params[key] = value;
          }
        }

        console.log("New request config:", newRequest);
        return axiosInstance(newRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        // 로그아웃 처리
        useStore.setState({
          jwt: "",
          refreshToken: "",
          userId: "",
          company: { name: "", address: "" },
          isSignin: false,
          userEmail: "",
          userName: "",
          subscriptionType: "",
          customerKey: "",
        });

        await toast.error("세션이 만료되었습니다. 다시 로그인해주세요.", {
          onClose: () => {
            window.location.href = "/signin";
          },
          autoClose: 500,
        });

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
export default axiosInstance;
