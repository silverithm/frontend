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
      name: "app-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // userId: state.userId,
        // jwt: state.jwt,
        // company: state.company,
        // isSignin: state.isSignin,
        // userEmail: state.userEmail,
        // userName: state.userName,
        // subscriptionType: state.subscriptionType,
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
