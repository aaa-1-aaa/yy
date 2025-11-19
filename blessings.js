import { blessings } from "./blessings-data.js";

const messageEl = document.getElementById("wishMessage");
const metaEl = document.getElementById("wishMeta");
const nextBtn = document.getElementById("nextWish");
const backBtn = document.getElementById("backToFireworks");

const cycleIntervalMs = 6000;
let cursor = Math.floor(Math.random() * blessings.length);
let cycleTimer = null;

function applyTransition(element, nextText) {
  if (!element) return;
  element.classList.add("is-transitioning");
  window.setTimeout(() => {
    element.textContent = nextText;
    element.classList.remove("is-transitioning");
  }, 180);
}

function renderBlessing(options = { animate: true }) {
  if (!messageEl || !metaEl) return;
  const blessing = blessings[cursor % blessings.length];
  if (options.animate) {
    applyTransition(messageEl, blessing.message);
    applyTransition(metaEl, blessing.relation);
  } else {
    messageEl.textContent = blessing.message;
    metaEl.textContent = blessing.relation;
  }
}

function showNextBlessing(options = { restartTimer: false }) {
  cursor += 1;
  renderBlessing();
  if (options.restartTimer) {
    restartAutoCycle();
  }
}

function startAutoCycle() {
  if (cycleTimer) return;
  cycleTimer = window.setInterval(() => {
    showNextBlessing();
  }, cycleIntervalMs);
}

function stopAutoCycle() {
  if (!cycleTimer) return;
  clearInterval(cycleTimer);
  cycleTimer = null;
}

function restartAutoCycle() {
  stopAutoCycle();
  startAutoCycle();
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopAutoCycle();
  } else {
    restartAutoCycle();
  }
});

nextBtn?.addEventListener("click", () => {
  showNextBlessing({ restartTimer: true });
});

backBtn?.addEventListener("click", () => {
  window.location.replace("./index.html");
});

renderBlessing({ animate: false });
startAutoCycle();

