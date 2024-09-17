import test from './dev/levels/test.glb?url'

const levels = {
  'test': {
    glb: test,
    waves: [
      {
        amount: 20,
        rate: 8,
        batch: 4,
        types: ["Zombies"],
        odds: [1],
      },
      {
        amount: 40,
        rate: 10,
        batch: 4,
        types: ["Zombies", "Neutrophil"],
        odds: [0.9, 0.1],
      },
      {
        amount: 80,
        rate: 8,
        batch: 4,
        types: ["Zombies", "Neutrophil", "NKCell"],
        odds: [0.7, 0.2, 0.1],
      },
      {
        amount: 120,
        rate: 4,
        batch: 2,
        types: ["Zombies", "Neutrophil", "NKCell", "Macrophage"],
        odds: [0.5, 0.25, 0.2, 0.05],
      },
      {
        amount: 200,
        rate: 8,
        batch: 10,
        types: ["Zombies", "Neutrophil", "NKCell", "Macrophage"],
        odds: [0.4, 0.25, 0.25, 0.1],
      },
    ]
  }

}

export default levels