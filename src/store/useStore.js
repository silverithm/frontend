import create from "zustand";

const useStore = create((set) => ({
  staticSelectedElderIds: [],
  staticSelectedEmployeeIds: [],
  setStaticSelectedElderIds: (ids) => set({ staticSelectedElderIds: ids }),
  setStaticSelectedEmployeeIds: (ids) =>
    set({ staticSelectedEmployeeIds: ids }),
}));

export default useStore;
