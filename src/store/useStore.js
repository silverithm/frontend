import { create } from "zustand";

const useStore = create((set) => ({
  jwt: "",
  userId: "",
  company: { name: "", address: "" },
  isSignin: false,
  userEmail: "",

  selectedElderIds: [],
  selectedEmployeeIds: [],
  employees: [],
  elders: [],
  durationTimes: [],
  setEmployees: (employees) => set({ employees: employees }),
  setElders: (elders) => set({ elders: elders }),
  setSelectedElderIds: (ids) => set({ selectedElderIds: ids }),
  setSelectedEmployeeIds: (ids) => set({ selectedEmployeeIds: ids }),
  setStaticDurationTimes: (durationTimes) =>
    set({ durationTimes: durationTimes }),

  setJwt: (jwt) => set({ jwt: jwt }),
  setUserId: (userId) => set({ userId: userId }),
  setCompany: (name, address) =>
    set({ company: { name: name, address: address } }),
  setIsSignin: (isSignin) => set({ isSignin: isSignin }),
  setUserEmail: (email) => set({ userEmail: email }),
}));

export default useStore;
