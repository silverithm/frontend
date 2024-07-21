import create from "zustand";

const useStore = create((set) => ({
  staticSelectedElderIds: [],
  staticSelectedEmployeeIds: [],
  staticEmployees: [],
  staticElders: [],
  staticDurationTimes: [],
  setStaticEmployees: (employees) => set({ staticEmployees: employees }),
  setStaticElders: (elders) => set({ staticElders: elders }),
  setStaticSelectedElderIds: (ids) => set({ staticSelectedElderIds: ids }),
  setStaticSelectedEmployeeIds: (ids) =>
    set({ staticSelectedEmployeeIds: ids }),
  setStaticDurationTimes: (durationTimes) =>
    set({ staticDurationTimes: durationTimes }),
}));

export default useStore;
