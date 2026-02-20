export function createStartStep(template, { onStart }) {
  const fragment = template.content.cloneNode(true);

  const widthInput = fragment.querySelector('.map-width');
  const heightInput = fragment.querySelector('.map-height');
  const startButton = fragment.querySelector('.start-button');
  startButton.addEventListener('click', () => {
    startButton.disabled = true;
    onStart({
      width: parseInt(widthInput.value, 10),
      height: parseInt(heightInput.value, 10),
    });
  });

  return fragment;
}

export function createActionStep(template, { step, onStepSubmit }) {
  const fragment = template.content.cloneNode(true);

  fragment.querySelector('.event-emoji').textContent = step.emoji || '';
  fragment.querySelector('.message').textContent = step.message || '';
  fragment.querySelector('.question').textContent = step.question;

  const choicesElement = fragment.querySelector('.choices');
  const resultElement = fragment.querySelector('.choice-result');
  const buttonTemplate = choicesElement.querySelector('.choice-button');
  for (const choice of step.choices) {
    const button = buttonTemplate.cloneNode(true);
    button.querySelector('.choice-emoji').textContent = choice.emoji;
    button.querySelector('.choice-content').textContent = choice.content;
    button.addEventListener('click', () => {
      choicesElement.querySelectorAll('.choice-button').forEach((b) => { b.disabled = true; });
      onStepSubmit(choice.id, ({ message, delta }) => {
        resultElement.querySelector('.choice-result-message').textContent = message;
        const deltaElement = resultElement.querySelector('.choice-result-delta');
        const entries = [
          { label: '♥️', value: delta.hitPoint },
          { label: '💰️', value: delta.money },
          { label: '⭐️', value: delta.score },
        ];
        for (const { label, value } of entries) {
          const span = document.createElement('span');
          span.textContent = `${label}${value >= 0 ? '+' : ''}${value}`;
          deltaElement.appendChild(span);
        }
        resultElement.classList.remove('d-none');
      });
    });
    choicesElement.appendChild(button);
  }
  buttonTemplate.remove();

  return fragment;
}

export function createEndStep(template, { state, result, onRetry }) {
  const fragment = template.content.cloneNode(true);

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
