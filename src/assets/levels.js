import test from './dev/levels/test.glb?url'

const levels = {
  'test': {
    glb: test,
    waves: [
      {
        amount: 20,
        rate: 5,
        batch: 4,
        types: ["Zombies"],
        odds: [1],
      },
      {
        amount: 60,
        rate: 4,
        batch: 7,
        types: ["Zombies", "Neutrophil"],
        odds: [0.9, 0.1],
      },
      {
        amount: 100,
        rate: 3,
        batch: 8,
        types: ["Zombies", "Neutrophil", "NKCell"],
        odds: [0.7, 0.2, 0.1],
      },
      {
        amount: 120,
        rate: 4,
        batch: 10,
        types: ["Zombies", "Neutrophil", "NKCell"],
        odds: [0.5, 0.25, 0.2, 0.05],
      },
    ]
  }

}

export default levels