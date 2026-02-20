import { TERRAIN_COLORS } from './constants.js';

export function renderWorldMap(canvas, world, position) {
  const ctx = canvas.getContext('2d');
  const { width, height, grid, goal } = world;
  const tileW = canvas.width / width;
  const tileH = canvas.height / height;

  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      ctx.fillStyle = TERRAIN_COLORS[grid[r][c].terrain];
      ctx.fillRect(c * tileW, r * tileH, tileW, tileH);
    }
  }

  // ゴール
  ctx.fillStyle = '#ffd700';
  ctx.beginPath();
  ctx.arc(goal.x * tileW + tileW / 2, goal.y * tileH + tileH / 2, tileW / 4, 0, Math.PI * 2);
  ctx.fill();

  // プレイヤー
  ctx.fillStyle = '#ff0000';
  ctx.beginPath();
  ctx.arc(position.x * tileW + tileW / 2, position.y * tileH + tileH / 2, tileW / 4, 0, Math.PI * 2);
  ctx.fill();
}
