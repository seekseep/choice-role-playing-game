import { WORLD, INITIAL_STATUS } from './data.js';
import { renderWorldMap } from './worldMap.js';
import { initialize, apply, fetchEvent } from './game.js';
import {
  createStartStep,
  createActionStep,
  createEndStep,
} from './step.js';

const canvas = document.getElementById('map-canvas');
const stepsContainer = document.getElementById('steps-container');
const startStepTemplate = document.getElementById('start-step-template');
const actionStepTemplate = document.getElementById('action-step-template');
const endStepTemplate = document.getElementById('end-step-template');

let game = initialize(WORLD, INITIAL_STATUS);

function scrollToBottom() {
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

function showLoading() {
  const div = document.createElement('div');
  div.id = 'loading-indicator';
  div.className = 'card mb-4';
  div.innerHTML = '<div class="card-body text-center"><div class="spinner-border" role="status"></div><p class="mt-2 text-muted">イベントを生成中...</p></div>';
  stepsContainer.appendChild(div);
  scrollToBottom();
}

function hideLoading() {
  const el = document.getElementById('loading-indicator');
  if (el) el.remove();
}

function startGame() {
  game = initialize(WORLD, INITIAL_STATUS);
  const fragment = createStartStep(startStepTemplate, { onStart: onGameStart });
  stepsContainer.appendChild(fragment);
}

async function onGameStart() {
  showLoading();
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
  scrollToBottom();
}

async function onChoiceSelected(choiceId) {
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
    scrollToBottom();
    return;
  }

  showLoading();
  await fetchEvent(game);
  hideLoading();
  renderCurrentStep();
}

startGame();
