import { createWorld, createWorldPlace } from './factory.js';

export const WORLD = createWorld({
  width: 4,
  height: 4,
  start: { x: 0, y: 0 },
  goal: { x: 3, y: 3 },
  grid: [
    [
      createWorldPlace({ id: 'place-0-0', terrain: 'town' }),
      createWorldPlace({ id: 'place-1-0', terrain: 'sand' }),
      createWorldPlace({ id: 'place-2-0', terrain: 'forest' }),
      createWorldPlace({ id: 'place-3-0', terrain: 'sand' })],
    [
      createWorldPlace({ id: 'place-0-1', terrain: 'sand' }),
      createWorldPlace({ id: 'place-1-1', terrain: 'mountain' }),
      createWorldPlace({ id: 'place-2-1', terrain: 'sand' }),
      createWorldPlace({ id: 'place-3-1', terrain: 'forest' })],
    [
      createWorldPlace({ id: 'place-0-2', terrain: 'forest' }),
      createWorldPlace({ id: 'place-1-2', terrain: 'sand' }),
      createWorldPlace({ id: 'place-2-2', terrain: 'river' }),
      createWorldPlace({ id: 'place-3-2', terrain: 'sand' })
    ],
    [
      createWorldPlace({ id: 'place-0-3', terrain: 'sand' }),
      createWorldPlace({ id: 'place-1-3', terrain: 'forest' }),
      createWorldPlace({ id: 'place-2-3', terrain: 'sand' }),
      createWorldPlace({ id: 'place-3-3', terrain: 'town' })
    ],
  ],
});

export const INITIAL_STATUS = {
  hitPoint: 10,
  money: 0,
  score: 0,
};
