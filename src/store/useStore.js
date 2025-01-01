import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useStore = create(
  persist(
    (set) => ({
      jwt: "",
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

      setUserName: (name) => set({ userName: name }),
      setEmployees: (employees) => set({ employees: employees }),
      setElders: (elders) => set({ elders: elders }),
      setSelectedElderIds: (ids) => set({ selectedElderIds: ids }),
      setSelectedEmployeeIds: (ids) => set({ selectedEmployeeIds: ids }),
      setStaticDurationTimes: (durationTimes) =>
        set({ durationTimes: durationTimes }),

      setJwt: (jwt) => set({ jwt: jwt }),
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
      name: "app-storage", // 로컬 스토리지에 저장될 키 이름
      storage: createJSONStorage(() => localStorage), // 기본값은 localStorage
    }
  )
);

export default useStore;
