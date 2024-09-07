import test from './dev/levels/test.glb?url'

const levels = {
  'test': {
    glb: test,
    waves: [
      {
        amount: 20,
        rate: 5,
        batch: 4,
        types: ["Zombies",],
        odds: [1,],
      },
      {
        amount: 60,
        rate: 4,
        batch: 7,
        types: ["Zombies",],
        odds: [1,],
      },
      {
        amount: 100,
        rate: 3,
        batch: 8,
        types: ["Zombies",],
        odds: [1,],
      },
    ]
  }

}

export default levels