import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useStore = create(
  persist(
    (set) => ({
      jwt: "",
      refreshToken: "",
      userId: "",
      company: { name: "", address: "" },
      isSignin: false,
      userEmail: "",
      userName: "",
      subscriptionType: "",
      selectedElderIds: [],
      selectedEmployeeIds: [],
      employees: [],
      elders: [],
      durationTimes: [],
      customerKey: "",
      subscriptionStatus: "",
      subscriptionStartDate: "",
      subscriptionEndDate: "",

      setSubscriptionStatus: (status) => set({ subscriptionStatus: status }),
      setSubscriptionStartDate: (startTime) =>
        set({ subscriptionStartDate: startTime }),
      setSubscriptionEndDate: (endTime) =>
        set({ subscriptionEndDate: endTime }),
      setCustomerKey: (key) => set({ customerKey: key }),
      setUserName: (name) => set({ userName: name }),
      setEmployees: (employees) => set({ employees: employees }),
      setElders: (elders) => set({ elders: elders }),
      setSelectedElderIds: (ids) => set({ selectedElderIds: ids }),
      setSelectedEmployeeIds: (ids) => set({ selectedEmployeeIds: ids }),
      setStaticDurationTimes: (durationTimes) =>
        set({ durationTimes: durationTimes }),

      setJwt: (jwt) => set({ jwt: jwt }),
      setRefreshToken: (refreshToken) => set({ refreshToken: refreshToken }),
      setUserId: (userId) => set({ userId: userId }),
      setCompany: (name, address, addressName) =>
        set({
          company: { name: name, address: address, addressName: addressName },
        }),
      setIsSignin: (isSignin) => set({ isSignin: isSignin }),
      setUserEmail: (email) => set({ userEmail: email }),
      setSubscriptionType: (subscriptionType) =>
        set({ subscriptionType: subscriptionType }),
    }),

    {
      name: "app-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userId: state.userId,
        jwt: state.jwt,
        refreshToken: state.refreshToken,
        company: state.company,
        isSignin: state.isSignin,
        userEmail: state.userEmail,
        userName: state.userName,
        subscriptionType: state.subscriptionType,
        customerKey: state.customerKey,
        // 구독 관련 정보는 로컬 스토리지에 저장하지 않고 로그인마다 새로 가져오도록 함
        // subscriptionStatus: state.subscriptionStatus,
        // subscriptionStartDate: state.subscriptionStartDate,
        // subscriptionEndDate: state.subscriptionEndDate,
        // selectedElderIds: state.selectedElderIds,
        // selectedEmployeeIds: state.selectedEmployeeIds,
        // employees: state.employees,
        // elders: state.elders,
        // durationTimes: state.durationTimes,
      }),
    }
  )
);

export default useStore;
