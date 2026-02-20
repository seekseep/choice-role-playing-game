import { GoogleGenerativeAI } from "@google/generative-ai";

const TERRAINS = ['sand', 'mountain', 'forest', 'sea', 'river', 'town'];

const POSITION_SCHEMA = {
  type: 'object',
  properties: {
    x: { type: 'integer' },
    y: { type: 'integer' },
  },
  required: ['x', 'y'],
};

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    start: POSITION_SCHEMA,
    goal: POSITION_SCHEMA,
    areas: {
      type: 'array',
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            terrain: {
              type: 'string',
              enum: TERRAINS,
            },
          },
          required: ['terrain'],
        },
      },
    },
  },
  required: ['start', 'goal', 'areas'],
};

function buildPrompt(width, height) {
  return `あなたはRPGゲームのワールドマップ生成AIです。
${width}x${height}のグリッドマップを生成してください。

## 制約
- areasは${height}行${width}列の2次元配列です（areas[row][col]）
- 各セルのterrainは次のいずれか: ${TERRAINS.join(', ')}
- startとgoalの座標を決めてください（x: 0〜${width - 1}, y: 0〜${height - 1}）
- startとgoalは離れた位置に配置してください
- startとgoalの地形は "town" にしてください
- 地形はバリエーション豊かに配置してください
- seaは端に配置し、陸地で囲まれないようにしてください
- riverはseaに隣接するか、連続して配置してください`;
}

function addIds(areas) {
  return areas.map((row, y) =>
    row.map((cell, x) => ({
      id: `place-${x}-${y}`,
      terrain: cell.terrain,
    }))
  );
}

export async function POST(request) {
  try {
    const { width = 4, height = 4 } = await request.json();
    const prompt = buildPrompt(width, height);

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    const result = await model.generateContent(prompt);
    const { start, goal, areas } = JSON.parse(result.response.text());

    const game = {
      world: {
        width,
        height,
        start,
        goal,
        areas: addIds(areas),
      },
      state: {
        hitPoint: 10,
        money: 0,
        score: 0,
        position: { x: start.x, y: start.y },
      },
      status: 'active',
      result: null,
      currentEvent: null,
      steps: [],
    };

    return Response.json(game);
  } catch (error) {
    console.error('API error:', error);
    return Response.json(
      { error: error.message || 'Unknown error' },
      { status: 500 },
    );
  }
}
