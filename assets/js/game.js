import { createState, createGame, createStep } from './factory.js';

export function initialize(world, initialStatus) {
  const state = createState({
    hitPoint: initialStatus.hitPoint,
    money: initialStatus.money,
    score: initialStatus.score,
    position: { x: world.start.x, y: world.start.y },
  });

  return createGame({ world, state });
}

export function apply(game, choiceId) {
  const choice = game.currentEvent.choices.find((c) => c.id === choiceId);

  game.steps[game.steps.length - 1].selectedChoiceId = choiceId;

  game.history.push({
    message: game.currentEvent.message,
    chosenLabel: choice.label,
  });

  const delta = choice.result.delta;
  game.state.hitPoint += delta.hitPoint;
  game.state.money += delta.money;
  game.state.score += delta.score;
  game.state.position.x += delta.move.dx;
  game.state.position.y += delta.move.dy;

  if (game.state.hitPoint <= 0) {
    game.status = 'end';
    game.result = { type: 'death' };
    game.currentEvent = null;
    return game;
  }

  if (game.state.position.x === game.world.goal.x && game.state.position.y === game.world.goal.y) {
    game.status = 'end';
    game.result = { type: 'clear' };
    game.currentEvent = null;
    return game;
  }

  return game;
}

export async function fetchEvent(game) {
  const { state, world } = game;
  const place = world.grid[state.position.y][state.position.x];

  const response = await fetch('/api/generate-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      state,
      terrain: place.terrain,
      placeId: place.id,
      world: { width: world.width, height: world.height, start: world.start, goal: world.goal },
      history: game.history,
    }),
  });

  const event = await response.json();
  const step = createStep({ ...event, stateView: game.state });

  game.currentEvent = event;
  game.steps.push(step);

  return game;
}
