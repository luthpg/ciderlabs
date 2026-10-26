let timer: ReturnType<typeof setTimeout>;

document.addEventListener('click', async (event) => {
  const button = (event.target as Element).closest<HTMLButtonElement>(
    '[data-copy], [data-copy-code]',
  );

  if (!button) return;

  const value =
    button.dataset.copy ??
    button.parentElement?.querySelector('pre code')?.textContent;

  if (!value) return;

  const status = document.querySelector<HTMLElement>('#copy-status');
  if (!status) return;

  try {
    await navigator.clipboard.writeText(value);
    status.textContent = 'コピーしました';
  } catch {
    status.textContent =
      'コピーできませんでした。テキストを選択してコピーしてください。';
  }

  clearTimeout(timer);
  status.classList.add('visible');

  timer = setTimeout(() => {
    status.classList.remove('visible');
  }, 3000);
});
