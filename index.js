const canvas = document.getElementById("fireworksCanvas");
const prompt = document.getElementById("acceptPrompt");
const ctx = canvas.getContext("2d");
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

const state = {
  fireworksFinished: false,
  prefersReducedMotion: reducedMotionQuery.matches,
};

const config = {
  promptDelay: 12000,
  launchInterval: 420,
  colors: ["#ff8fb1", "#ffd166", "#c3a7ff", "#7ed6ff", "#ffb997"],
};

const fireworks = [];
const particles = [];
let lastLaunch = 0;
let lastTime = 0;

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  const { clientWidth, clientHeight } = canvas;
  canvas.width = clientWidth * ratio;
  canvas.height = clientHeight * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function launchFirework() {
  const color = config.colors[Math.floor(Math.random() * config.colors.length)];
  fireworks.push({
    x: randomRange(canvas.clientWidth * 0.2, canvas.clientWidth * 0.8),
    y: canvas.clientHeight + 20,
    vy: randomRange(-360, -420),
    color,
    targetY: randomRange(canvas.clientHeight * 0.2, canvas.clientHeight * 0.45),
  });
}

function explode({ x, y, color }) {
  const count = 26 + Math.floor(Math.random() * 15);
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = randomRange(60, 160);
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      alpha: 1,
      decay: randomRange(0.01, 0.03),
      color,
    });
  }
}

function drawFirework(firework) {
  ctx.save();
  ctx.beginPath();
  ctx.fillStyle = firework.color;
  ctx.shadowColor = firework.color;
  ctx.shadowBlur = 25;
  ctx.arc(firework.x, firework.y, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawParticle(particle) {
  ctx.save();
  ctx.globalAlpha = particle.alpha;
  ctx.fillStyle = particle.color;
  ctx.shadowColor = particle.color;
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function update(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const delta = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  ctx.fillStyle = "rgba(255, 245, 251, 0.18)";
  ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

  if (!state.prefersReducedMotion && timestamp - lastLaunch > config.launchInterval) {
    launchFirework();
    lastLaunch = timestamp;
  }

  for (let i = fireworks.length - 1; i >= 0; i -= 1) {
    const fw = fireworks[i];
    fw.y += fw.vy * delta;
    fw.vy += 180 * delta;
    drawFirework(fw);
    if (fw.y <= fw.targetY || fw.vy >= 0) {
      explode(fw);
      fireworks.splice(i, 1);
    }
  }

  for (let i = particles.length - 1; i >= 0; i -= 1) {
    const p = particles[i];
    p.x += p.vx * delta;
    p.y += p.vy * delta;
    p.vy += 50 * delta;
    p.alpha -= p.decay;
    drawParticle(p);
    if (p.alpha <= 0) {
      particles.splice(i, 1);
    }
  }

  if (!state.prefersReducedMotion) {
    requestAnimationFrame(update);
  }
}

function showPrompt() {
  if (!prompt) return;
  state.fireworksFinished = true;
  prompt.classList.remove("hidden");
  prompt.classList.add("show");
}

function hidePrompt() {
  if (!prompt) return;
  prompt.classList.add("hidden");
  prompt.classList.remove("show");
}

function init() {
  resizeCanvas();
  if (!state.prefersReducedMotion) {
    requestAnimationFrame(update);
    setTimeout(showPrompt, config.promptDelay);
    return;
  }
  ctx.fillStyle = "#ffdce9";
  ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  showPrompt();
}

window.addEventListener("resize", resizeCanvas, { passive: true });

const handleMotionChange = (event) => {
  state.prefersReducedMotion = event.matches;
  if (event.matches) {
    showPrompt();
    return;
  }
  lastTime = 0;
  lastLaunch = 0;
  fireworks.length = 0;
  particles.length = 0;
  hidePrompt();
  requestAnimationFrame(update);
  setTimeout(showPrompt, config.promptDelay);
};

if (typeof reducedMotionQuery.addEventListener === "function") {
  reducedMotionQuery.addEventListener("change", handleMotionChange);
} else if (typeof reducedMotionQuery.addListener === "function") {
  reducedMotionQuery.addListener(handleMotionChange);
}
init();

prompt?.addEventListener("click", (event) => {
  if (!(event.target instanceof HTMLButtonElement)) return;
  const choice = event.target.dataset.choice;
  if (!choice) return;
  window.location.href = "./blessings.html";
});

