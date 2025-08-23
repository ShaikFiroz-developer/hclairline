// Simple global loading manager with subscription
let counter = 0;
let listeners = new Set();

export function showLoader() {
  counter += 1;
  notify();
}

export function hideLoader() {
  counter = Math.max(0, counter - 1);
  notify();
}

export function resetLoader() {
  counter = 0;
  notify();
}

export function isLoading() {
  return counter > 0;
}

export function subscribe(fn) {
  listeners.add(fn);
  // emit current state immediately
  fn(isLoading());
  return () => listeners.delete(fn);
}

function notify() {
  const state = isLoading();
  listeners.forEach((fn) => {
    try { fn(state); } catch (e) { /* noop */ }
  });
}
