import { create } from "zustand"

const gamepadState = {
  moveX: 0,
  moveY: 0,
  jump: false,
  interact: false,
  inventoryLeft: false,
  inventoryRight: false,
  inventoryUse: false,
}

export const useGameStore = create((set) => ({
  mode: 0,
  setMode: (mode) => set({ mode}),
  options:{
    volume: 1,
  },
  setOptions: (newOptions) => set((state) => ({
    options: { ...state.options, ...newOptions},
  })),
  level: "test",
  setLevel: (level) => set({ level }),
  getGamepad: () => gamepadState,
}))