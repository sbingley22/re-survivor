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

export const useGameStore = create((set, get) => ({
  mode: 0,
  setMode: (mode) => set({ mode}),
  options:{
    volume: 1,
    altCostume: 0,
  },
  setOptions: (newOptions) => set((state) => ({
    options: { ...state.options, ...newOptions},
  })),
  level: "test",
  setLevel: (level) => set({ level }),
  getGamepad: () => gamepadState,

  player: null,
  setPlayer: (player) => set({ player }),
  ground: null,
  setGround: (ground) => set({ ground }),

  inventory: [
    {name: "stun grenade", amount: 1},
    {name: "", amount: 0},
    {name: "", amount: 0},
    {name: "", amount: 0},
    {name: "", amount: 0},
    {name: "", amount: 0},
  ],
  setInventory: (inventory) => set({ inventory }),
  inventorySlot: 0,
  setInventorySlot: (inventorySlot) => set({ inventorySlot }),
  inventoryRemoveItem: (slot, amount = 1) => {
    const state = get()
    const tempInv = [...state.inventory]
    tempInv[slot].amount -= amount

    if (tempInv[slot].amount <= 0) {
      tempInv[slot].name = ""
      tempInv[slot].amount = 0
    }

    set({ inventory: tempInv })
  },

}))
