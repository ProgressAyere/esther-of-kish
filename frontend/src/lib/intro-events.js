// Tiny hand-off between the site intro (SiteHeader) and the sections beneath it.
// The intro calls markIntroRevealed() when the cream panel has filled the screen;
// sections can then play their own reveal animations (see BeadHero).

export const INTRO_REVEAL_EVENT = "esther:intro-reveal";

export function resetIntroState() {
  if (typeof window === "undefined") return;
  window.__estherIntroRevealed = false;
}

export function hasIntroRevealed() {
  return typeof window !== "undefined" && window.__estherIntroRevealed === true;
}

export function markIntroRevealed() {
  if (typeof window === "undefined") return;
  window.__estherIntroRevealed = true;
  window.dispatchEvent(new Event(INTRO_REVEAL_EVENT));
}

// Runs `callback` once the intro has revealed (immediately if it already has).
// Returns a cleanup function.
export function onIntroReveal(callback) {
  if (hasIntroRevealed()) {
    callback();
    return () => {};
  }
  window.addEventListener(INTRO_REVEAL_EVENT, callback, { once: true });
  return () => window.removeEventListener(INTRO_REVEAL_EVENT, callback);
}
