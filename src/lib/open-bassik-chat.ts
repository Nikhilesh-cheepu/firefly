/** Open Bassik concierge sheet once the official embed script has loaded. */
export function openBassikChat(): void {
  if (typeof window === "undefined") return;

  if (window.BassikChat?.open) {
    window.BassikChat.open();
    return;
  }

  let tries = 0;
  const timer = window.setInterval(() => {
    tries += 1;
    if (window.BassikChat?.open) {
      window.clearInterval(timer);
      window.BassikChat.open();
    } else if (tries >= 25) {
      window.clearInterval(timer);
    }
  }, 200);
}
