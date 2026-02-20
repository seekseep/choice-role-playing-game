export function createState({ hitPoint, money, score, position }) {
  return { hitPoint, money, score, position };
}

export function createWorldPlace({ id, terrain }) {
  return { id, terrain };
}

export function createWorld({ width, height, start, goal, grid }) {
  return { width, height, start, goal, grid };
}

export function createStep({ message, question, choices, stateView }) {
  return {
    message,
    question,
    choices: choices.map(({ id, label }) => ({ id, label })),
    stateView,
    selectedChoiceId: null,
  };
}

export function createGame({ world, state, status = 'active', result = null, currentEvent = null, steps = [], history = [] }) {
  return { world, state, status, result, currentEvent, steps, history };
}
