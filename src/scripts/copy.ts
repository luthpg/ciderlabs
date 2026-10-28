let toastTimer: ReturnType<typeof setTimeout>;
const buttonTimers = new WeakMap<
  HTMLButtonElement,
  ReturnType<typeof setTimeout>
>();

document.addEventListener('click', async (event) => {
  const button = (event.target as Element).closest<HTMLButtonElement>(
    '[data-copy], [data-copy-code]',
  );

  if (!button) return;

  const value =
    button.dataset.copy ??
    button
      .closest('.code-block, .code-block-container')
      ?.querySelector('pre code')?.textContent;

  if (!value) return;

  const status = document.querySelector<HTMLElement>('#copy-status');
  const label = button.querySelector<HTMLElement>('.copy-label');
  const defaultLabel =
    button.dataset.defaultLabel ?? label?.textContent ?? 'コピー';

  if (!button.dataset.defaultLabel) {
    button.dataset.defaultLabel = defaultLabel;
  }

  try {
    await navigator.clipboard.writeText(value);
    if (status) {
      status.textContent = 'クリップボードにコピーしました';
    }
    button.dataset.copied = 'true';
    if (label) {
      label.textContent = button.dataset.copiedLabel ?? 'コピー済み';
    } else if (button.hasAttribute('data-copy')) {
      button.textContent = '✓ コピー済み';
    }

    const prevTimer = buttonTimers.get(button);
    if (prevTimer !== undefined) {
      clearTimeout(prevTimer);
    }

    const nextTimer = setTimeout(() => {
      delete button.dataset.copied;
      if (label) {
        label.textContent = button.dataset.defaultLabel ?? 'コピー';
      } else if (button.hasAttribute('data-copy')) {
        button.textContent = button.dataset.defaultLabel ?? 'コピー';
      }
    }, 2000);
    buttonTimers.set(button, nextTimer);
  } catch {
    if (status) {
      status.textContent =
        'コピーできませんでした。テキストを選択してコピーしてください。';
    }
  }

  if (status) {
    clearTimeout(toastTimer);
    status.classList.add('visible');

    toastTimer = setTimeout(() => {
      status.classList.remove('visible');
    }, 2500);
  }
});
