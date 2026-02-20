# データ構造仕様

## 全体構造

```
Game
├── world: World          … ワールド定義（基本固定）
├── gameEvents: GameEvent[] … イベント定義（基本固定）
├── state: State           … プレイヤーの可変状態
└── steps: Step[]          … ステップ履歴（毎ターン追加）
```

---

## State（可変）

プレイヤーの現在の状態。ゲーム進行で変化する。

| フィールド | 型 | 説明 |
|---|---|---|
| `hitPoint` | `number` | 体力 |
| `money` | `number` | 所持金 |
| `score` | `number` | スコア |
| `position` | `{ x: number, y: number }` | 現在地 |

---

## World / WorldPlace（基本固定）

### World

| フィールド | 型 | 説明 |
|---|---|---|
| `width` | `number` | マップの横幅 |
| `height` | `number` | マップの縦幅 |
| `start` | `{ x: number, y: number }` | 開始地点 |
| `goal` | `{ x: number, y: number }` | ゴール地点 |
| `grid` | `WorldPlace[][]` | `grid[y][x]` でアクセス |

### WorldPlace

| フィールド | 型 | 説明 |
|---|---|---|
| `id` | `string` | 場所の識別子（GameEvent の `placeId` と紐づく） |
| `terrain` | `Terrain` | 地形タイプ |

### Terrain（地形）

| 値 | 説明 |
|---|---|
| `"grass"` | 草原 |
| `"mountain"` | 山 |
| `"forest"` | 森 |
| `"sea"` | 海 |
| `"river"` | 川 |
| `"sand"` | 砂漠 |
| `"town"` | 町 |

---

## GameEvent（イベント定義）

`Game.gameEvents` に配列で格納する。`placeId` で WorldPlace と紐づける。同じ `placeId` に複数のイベントがある場合、ランダムに1つ選ばれる。

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| `id` | `string` | 必須 | イベントの識別子 |
| `placeId` | `string` | 必須 | 対象の WorldPlace の `id` |
| `message` | `string` | 必須 | イベントの説明テキスト |
| `question` | `string` | 必須 | 表示する質問文 |
| `choices` | `Choice[]` | 必須 | 選択肢の一覧 |

---

## Choice / Result / Delta（選択と結果）

### Choice

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| `id` | `string` | 必須 | 選択肢の識別子 |
| `label` | `string` | 必須 | 表示テキスト |
| `result` | `Result` | 必須 | 選択した場合の結果 |

### Result

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| `delta` | `Delta` | 任意 | State の増減・移動 |
| `nextEventId` | `string` | 任意 | 同 WorldPlace 内で次に発火する GameEvent の ID |
| `message` | `string` | 任意 | 結果テキスト（演出用） |

### Delta

| フィールド | 型 | 説明 |
|---|---|---|
| `hitPoint` | `number` | HP の増減（`+` / `-`） |
| `money` | `number` | 所持金の増減 |
| `score` | `number` | スコアの増減 |
| `move` | `{ dx: number, dy: number }` | 相対移動 |
| `setPosition` | `{ x: number, y: number }` | 絶対移動（ワープ等） |

---

## Step（画面表示用 ViewModel）

毎ターン生成する。描画に必要な情報だけを持つ。

### Step

| フィールド | 型 | 説明 |
|---|---|---|
| `question` | `string` | 表示する質問文 |
| `choices` | `{ id: string, label: string }[]` | 選択肢（ID とラベルのみ） |
| `mapView` | `MapView` | マップ表示用データ |
| `stateView` | `State` | 現在の State のスナップショット |

### MapView

| フィールド | 型 | 説明 |
|---|---|---|
| `width` | `number` | マップ横幅 |
| `height` | `number` | マップ縦幅 |
| `goal` | `{ x: number, y: number }` | ゴール地点 |
| `position` | `{ x: number, y: number }` | プレイヤー現在地 |
| `terrainGrid` | `Terrain[][]` | 表示用の地形グリッド |

