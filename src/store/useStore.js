import { create } from "zustand";

const useStore = create((set) => ({
  jwt: "",
  userId: "",
  company: { name: "", address: "" },
  isSignin: false,
  userEmail: "",

  staticSelectedElderIds: [],
  staticSelectedEmployeeIds: [],
  staticEmployees: [],
  staticElders: [],
  staticDurationTimes: [],
  setJwt: (jwt) => set({ jwt: jwt }),
  setUserId: (userId) => set({ userId: userId }),
  setCompany: (name, address) =>
    set({ company: { name: name, address: address } }),
  setIsSignin: (isSignin) => set({ isSignin: isSignin }),
  setUserEmail: (email) => set({ userEmail: email }),
  setStaticEmployees: (employees) => set({ staticEmployees: employees }),
  setStaticElders: (elders) => set({ staticElders: elders }),
  setStaticSelectedElderIds: (ids) => set({ staticSelectedElderIds: ids }),
  setStaticSelectedEmployeeIds: (ids) =>
    set({ staticSelectedEmployeeIds: ids }),
  setStaticDurationTimes: (durationTimes) =>
    set({ staticDurationTimes: durationTimes }),
}));

export default useStore;
