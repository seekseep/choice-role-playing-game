export function createStartStep(template, { onStart }) {
  const fragment = template.content.cloneNode(true);

  const startButton = fragment.querySelector('.start-button');
  startButton.addEventListener('click', () => {
    startButton.disabled = true;
    onStart();
  });

  return fragment;
}

export function createActionStep(template, { step, onStepSubmit }) {
  const fragment = template.content.cloneNode(true);

  fragment.querySelector('.state-hit-point').textContent = step.stateView.hitPoint;
  fragment.querySelector('.state-money').textContent = step.stateView.money;
  fragment.querySelector('.state-score').textContent = step.stateView.score;

  fragment.querySelector('.message').textContent = step.message || '';
  fragment.querySelector('.question').textContent = step.question;

  const choicesElement = fragment.querySelector('.choices');
  const buttonTemplate = choicesElement.querySelector('.choice-button');
  for (const choice of step.choices) {
    const button = buttonTemplate.cloneNode(true);
    button.textContent = choice.label;
    button.addEventListener('click', () => {
      choicesElement.querySelectorAll('.choice-button').forEach((b) => { b.disabled = true; });
      onStepSubmit(choice.id);
    });
    choicesElement.appendChild(button);
  }
  buttonTemplate.remove();

  return fragment;
}

export function createEndStep(template, { state, result, onRetry }) {
  const fragment = template.content.cloneNode(true);

  fragment.querySelector('.state-hit-point').textContent = state.hitPoint;
  fragment.querySelector('.state-money').textContent = state.money;
  fragment.querySelector('.state-score').textContent = state.score;

  const messageElement = fragment.querySelector('.result-message');
  const detailElement = fragment.querySelector('.result-detail');

  if (result.type === 'clear') {
    messageElement.textContent = 'ゴールに到着しました！';
    detailElement.textContent = `最終スコア: ${state.score}`;
  } else {
    messageElement.textContent = 'ゲームオーバー';
    detailElement.textContent = 'HPが0になりました…';
  }

  const retryButton = fragment.querySelector('.retry-button');
  retryButton.addEventListener('click', onRetry);

  return fragment;
}
