import { GoogleGenerativeAI } from "@google/generative-ai";

const TERRAIN_NAMES = {
  sand: '砂漠', mountain: '山', forest: '森', sea: '海', river: '川', town: '町',
};

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    placeId: { type: 'string' },
    message: { type: 'string' },
    question: { type: 'string' },
    choices: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          label: { type: 'string' },
          result: {
            type: 'object',
            properties: {
              delta: {
                type: 'object',
                properties: {
                  hitPoint: { type: 'integer' },
                  money: { type: 'integer' },
                  score: { type: 'integer' },
                  move: {
                    type: 'object',
                    properties: {
                      dx: { type: 'integer' },
                      dy: { type: 'integer' },
                    },
                    required: ['dx', 'dy'],
                  },
                },
                required: ['hitPoint', 'money', 'score', 'move'],
              },
              message: { type: 'string' },
            },
            required: ['delta', 'message'],
          },
        },
        required: ['id', 'label', 'result'],
      },
    },
  },
  required: ['id', 'placeId', 'message', 'question', 'choices'],
};

function computeValidMoves(position, world) {
  const moves = [];
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const nx = position.x + dx;
    const ny = position.y + dy;
    if (nx >= 0 && nx < world.width && ny >= 0 && ny < world.height) {
      moves.push({ dx, dy });
    }
  }
  if (position.x === world.goal.x && position.y === world.goal.y) {
    moves.push({ dx: 0, dy: 0 });
  }
  return moves;
}

function buildPrompt(state, terrain, placeId, validMoves, history) {
  const historyText = (history || [])
    .slice(-3)
    .map(h => `- ${h.message}（選択: ${h.chosenLabel}）`)
    .join('\n');

  return `あなたは選択型RPGゲームのイベント生成AIです。
プレイヤーの現在の状況に基づいて、次のゲームイベントを生成してください。

## プレイヤーの状態
- HP: ${state.hitPoint}
- 所持金: ${state.money}
- スコア: ${state.score}
- 現在地: (${state.position.x}, ${state.position.y})
- 地形: ${TERRAIN_NAMES[terrain] || terrain}

## これまでの冒険
${historyText || 'なし（冒険の始まり）'}

## 移動の制約
各選択肢のmoveには、以下のいずれかの値のみ使用可能です:
${validMoves.map(m => `{ "dx": ${m.dx}, "dy": ${m.dy} }`).join('\n')}

各選択肢は異なるmoveの値を使ってください。
選択肢は必ず2つ生成してください。
placeIdは "${placeId}" にしてください。

## 数値の制約
- hitPointの変動は -3 から +3 の範囲
- moneyの変動は -3 から +5 の範囲
- scoreの変動は 0 から +5 の範囲
${state.hitPoint <= 3 ? '- HPが低いので大ダメージは避けてください' : ''}`;
}

function validateMoves(event, validMoves) {
  for (let i = 0; i < event.choices.length; i++) {
    const move = event.choices[i].result.delta.move;
    const isValid = validMoves.some(m => m.dx === move.dx && m.dy === move.dy);
    if (!isValid) {
      event.choices[i].result.delta.move = validMoves[i % validMoves.length];
    }
  }
  return event;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { state, terrain, placeId, world, history } = req.body;
  const validMoves = computeValidMoves(state.position, world);
  const prompt = buildPrompt(state, terrain, placeId, validMoves, history);

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
    },
  });

  const result = await model.generateContent(prompt);
  const event = JSON.parse(result.response.text());

  validateMoves(event, validMoves);

  return res.status(200).json(event);
}
