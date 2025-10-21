// starfield.js
const canvas = document.getElementById("starfield");
const ctx = canvas.getContext("2d");

let stars = [];
let width = window.innerWidth;
let height = window.innerHeight;

canvas.width = width;
canvas.height = height;

const STAR_COLOR = "rgba(29,231,255,0.8)";
const STAR_COUNT = 700;
const SPEED = 0.15;

function initStars() {
  stars = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: Math.random() * width - width / 2,
      y: Math.random() * height - height / 2,
      z: Math.random() * width,
    });
  }
}

function moveStars() {
  for (let s of stars) {
    s.z -= SPEED * width;
    if (s.z <= 0) s.z = width;
  }
}

function drawStars() {
  ctx.fillStyle = "rgba(2,4,10,0.35)";
  ctx.fillRect(0, 0, width, height);

  for (let s of stars) {
    const k = 128.0 / s.z;
    const px = s.x * k + width / 2;
    const py = s.y * k + height / 2;
    if (px >= 0 && px <= width && py >= 0 && py <= height) {
      const size = (1 - s.z / width) * 3.2;
      ctx.beginPath();
      ctx.fillStyle = STAR_COLOR;
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function animation() {
  moveStars();
  drawStars();
  requestAnimationFrame(animation);
}

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
  initStars();
}

window.addEventListener("resize", resize);
initStars();
animation();
