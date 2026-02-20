import { renderWorldMap } from './worldMap.js';
import { apply, fetchEvent } from './game.js';
import {
  createStartStep,
  createActionStep,
  createEndStep,
} from './step.js';

const canvas = document.getElementById('map-canvas');
const playerStatus = document.getElementById('player-status');
const statusHitPoint = document.getElementById('status-hit-point');
const statusMoney = document.getElementById('status-money');
const statusScore = document.getElementById('status-score');
const stepsContainer = document.getElementById('steps-container');
const loadingIndicator = document.getElementById('loading-indicator');
const loadingMessage = loadingIndicator.querySelector('.loading-message');
const startStepTemplate = document.getElementById('start-step-template');
const actionStepTemplate = document.getElementById('action-step-template');
const endStepTemplate = document.getElementById('end-step-template');

let game = null;

function renderStatus(state) {
  playerStatus.classList.remove('d-none');
  statusHitPoint.textContent = state.hitPoint;
  statusMoney.textContent = state.money;
  statusScore.textContent = state.score;
}

function scrollToBottom() {
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

function showLoading(message) {
  loadingMessage.textContent = message;
  loadingIndicator.classList.remove('d-none');
  scrollToBottom();
}

function hideLoading() {
  loadingIndicator.classList.add('d-none');
}

function startGame() {
  const fragment = createStartStep(startStepTemplate, { onStart: onGameStart });
  stepsContainer.appendChild(fragment);
}

async function onGameStart() {
  showLoading('ゲームを生成中...');
  const response = await fetch(new URL('/api/games', window.location.origin), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ width: 4, height: 4 }),
  });
  game = await response.json();
  hideLoading();

  renderWorldMap(canvas, game.world, game.state.position);
  renderStatus(game.state);

  showLoading('イベントを生成中...');
  await fetchEvent(game);
  hideLoading();
  renderCurrentStep();
}

function renderCurrentStep() {
  const step = game.steps[game.steps.length - 1];

  const fragment = createActionStep(actionStepTemplate, {
    step,
    onStepSubmit: onChoiceSelected,
  });
  stepsContainer.appendChild(fragment);
  renderWorldMap(canvas, game.world, game.state.position);
  renderStatus(game.state);
  scrollToBottom();
}

async function onChoiceSelected(choiceId, showResult) {
  const choice = game.currentEvent.choices.find((c) => c.id === choiceId);
  showResult({ message: choice.result.message, delta: choice.result.delta });

  game = apply(game, choiceId);

  if (game.status === 'end') {
    const fragment = createEndStep(endStepTemplate, {
      state: game.state,
      result: game.result,
      onRetry() {
        stepsContainer.innerHTML = '';
        startGame();
      },
    });
    stepsContainer.appendChild(fragment);
    renderStatus(game.state);
    scrollToBottom();
    return;
  }

  showLoading('イベントを生成中...');
  await fetchEvent(game);
  hideLoading();
  renderCurrentStep();
}

startGame();
