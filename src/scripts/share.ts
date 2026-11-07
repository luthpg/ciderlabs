let shareToastTimer: ReturnType<typeof setTimeout> | undefined;
const shareButtonTimers = new WeakMap<
  HTMLButtonElement,
  ReturnType<typeof setTimeout>
>();

function showToast(message: string) {
  const status = document.querySelector<HTMLElement>('#copy-status');
  if (status == null) return;

  status.textContent = message;
  if (shareToastTimer !== undefined) {
    clearTimeout(shareToastTimer);
  }
  status.classList.add('visible');

  shareToastTimer = setTimeout(() => {
    status.classList.remove('visible');
  }, 2500);
}

async function copyUrlFallback(url: string, button: HTMLButtonElement) {
  const label = button.querySelector<HTMLElement>('.share-label');
  const defaultLabel =
    button.dataset.defaultLabel ?? label?.textContent ?? '共有';
  const copiedLabel = button.dataset.copiedLabel ?? 'URLをコピーしました';

  try {
    await navigator.clipboard.writeText(url);
    showToast('ページURLをクリップボードにコピーしました');

    button.dataset.shared = 'true';
    if (label != null) {
      label.textContent = copiedLabel;
    }

    const prevTimer = shareButtonTimers.get(button);
    if (prevTimer !== undefined) {
      clearTimeout(prevTimer);
    }

    const nextTimer = setTimeout(() => {
      delete button.dataset.shared;
      if (label != null) {
        label.textContent = defaultLabel;
      }
    }, 2000);
    shareButtonTimers.set(button, nextTimer);
  } catch {
    showToast('URLをコピーできませんでした。');
  }
}

document.addEventListener('click', async (event) => {
  const button = (event.target as Element).closest<HTMLButtonElement>(
    '[data-share]',
  );
  if (button == null) return;

  const url = button.dataset.shareUrl || window.location.href;
  const title = button.dataset.shareTitle || document.title;
  const text =
    button.dataset.shareText ||
    document
      .querySelector('meta[name="description"]')
      ?.getAttribute('content') ||
    '';

  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title,
        text,
        url,
      });
    } catch (err) {
      // ユーザーキャンセル時は無視、それ以外の失敗はクリップボードコピーへフォールバック
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      await copyUrlFallback(url, button);
    }
  } else {
    await copyUrlFallback(url, button);
  }
});

export {};
