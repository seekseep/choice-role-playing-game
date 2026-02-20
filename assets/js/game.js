export function apply(game, choiceId) {
  const choice = game.currentEvent.choices.find((c) => c.id === choiceId);

  game.steps[game.steps.length - 1].selectedChoiceId = choiceId;

  const { delta } = choice.result;
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

function getHistory(steps) {
  return steps
    .filter(s => s.selectedChoiceId)
    .map(s => ({
      message: s.message,
      chosenContent: s.choices.find(c => c.id === s.selectedChoiceId).content,
    }));
}

export async function fetchEvent(game) {
  const { state, world } = game;
  const place = world.areas[state.position.y][state.position.x];

  const response = await fetch(new URL('/api/events', window.location.origin), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      state,
      terrain: place.terrain,
      placeId: place.id,
      world: { width: world.width, height: world.height, start: world.start, goal: world.goal },
      history: getHistory(game.steps),
    }),
  });

  const event = await response.json();

  game.currentEvent = event;
  game.steps.push({
    emoji: event.emoji,
    message: event.message,
    question: event.question,
    choices: event.choices.map(({ id, emoji, content }) => ({ id, emoji, content })),
    stateView: { ...state },
    selectedChoiceId: null,
  });

  return game;
}
