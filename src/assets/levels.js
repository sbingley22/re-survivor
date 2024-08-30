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
        amount: 20,
        rate: 5,
        batch: 6,
        types: ["Zombies",],
        odds: [1,],
      },
    ]
  }

}

export default levels