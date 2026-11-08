let toastTimer: ReturnType<typeof setTimeout> | undefined;

export function showToast(message: string) {
  const status = document.querySelector<HTMLElement>('#copy-status');
  if (status == null) return;

  status.textContent = message;
  if (toastTimer !== undefined) {
    clearTimeout(toastTimer);
  }
  status.classList.add('visible');

  toastTimer = setTimeout(() => {
    status.classList.remove('visible');
  }, 2500);
}
