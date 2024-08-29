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
    // character: "jill",
    character: "goth",
  },
  setOptions: (newOptions) => set((state) => ({
    options: { ...state.options, ...newOptions},
  })),
  level: "test",
  setLevel: (level) => set({ level }),
  score: 0,
  setScore: (score) => set({ score }),
  getGamepad: () => gamepadState,

  player: null,
  setPlayer: (player) => set({ player }),
  ground: null,
  setGround: (ground) => set({ ground }),

  enemyGroup: null,
  setEnemyGroup: (enemyGroup) => set({ enemyGroup }),
  enemies: [],
  setEnemies: (enemies) => set({ enemies }),
  enemiesRemove: (id) => {
    set((state) => ({
    enemies: state.enemies.filter(e => e.id !== id)
  }));
  },
  enemiesAdd: (newEnemies) => {
    const state = get()
    const tempE = [...state.enemies]
    newEnemies.forEach(e=>{
      tempE.push({
        id: e.id,
        type: e.type,
        position: e.position,
      })
    })
    set({ enemies: tempE })
  },
  enemyAdd: (id, type, position) => {
    const state = get()
    const tempE = [...state.enemies]
    tempE.push({
      id: id,
      type: type,
      position: position,
    })
    set({ enemies: tempE })
  },

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
  inventoryAddItem: (name, amount) => {
    const state = get()
    const tempInv = [...state.inventory]
    let slot = -1
    let nextSlot = -1
    tempInv.forEach((inv,index)=> {
      if (slot !== -1) return
      if (inv.name === name) slot = index
      else if (inv.name === "" && nextSlot === -1) nextSlot = index
    })
    if (slot === -1) {
      if (nextSlot === -1) return false
      slot = nextSlot
    }
    tempInv[slot].name = name
    tempInv[slot].amount += amount
    set({ inventory: tempInv })
  },

  hudInfo: {
    health: 100,
    msg: "",
    status: null,
  },
  setHudInfo: (hudInfo) => set({ hudInfo }),
  setHudInfoParameter: (newParameter) => set((state) => ({
    hudInfo: { ...state.hudInfo, ...newParameter },
  })),

}))
