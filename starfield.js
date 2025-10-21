// starfield.js
// Estrellas moviéndose hacia el espectador (warp/star-wars style), optimizado para demo.
// No external deps.

(function () {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  let w = canvas.width = innerWidth;
  let h = canvas.height = innerHeight;
  let stars = [];
  const STAR_BASE = 9000;
  const STAR_COUNT = Math.max(150, Math.floor((w * h) / STAR_BASE));
  const center = { x: w / 2, y: h / 2 };
  let lastTime = performance.now();
  let speedMultiplier = 1.0;
  let mouse = { x: center.x, y: center.y, active: false };

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function init() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      const angle = rand(0, Math.PI * 2);
      const r = rand(0, Math.max(w, h) * 0.5);
      stars.push({
        x: center.x + Math.cos(angle) * r,
        y: center.y + Math.sin(angle) * r,
        vx: 0, vy: 0,
        z: rand(0.1, 1),
        speed: rand(0.2, 1.8),
        px: 0, py: 0
      });
    }
  }

  function resize() {
    w = canvas.width = innerWidth;
    h = canvas.height = innerHeight;
    center.x = w / 2; center.y = h / 2;
    init();
  }
  window.addEventListener('resize', resize);

  window.addEventListener('mousemove', (e) => {
    mouse.active = true;
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener('mouseleave', () => mouse.active = false);

  function update(dt) {
    const cx = mouse.active ? mouse.x : center.x;
    const cy = mouse.active ? mouse.y : center.y;
    for (const s of stars) {
      s.px = s.x; s.py = s.y;
      const dx = s.x - cx;
      const dy = s.y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      // Movemos la estrella alejándola del centro (crea streaks)
      const factor = (1.5 - s.z) * (1 + dist / Math.max(w, h));
      const sp = s.speed * factor * speedMultiplier * dt * 0.08;
      s.x += (dx / dist) * sp * 8;
      s.y += (dy / dist) * sp * 8;
      // Simular "acercamiento" cambiando z
      s.z -= dt * 0.0007 * s.speed;
      // Si sale de pantalla, reubicar cerca del centro en posición aleatoria
      if (s.x < -80 || s.x > w + 80 || s.y < -80 || s.y > h + 80 || s.z <= 0) {
        const angle = rand(0, Math.PI * 2);
        const distFromCenter = rand(6, Math.max(w, h) * 0.08);
        s.x = cx + Math.cos(angle) * distFromCenter;
        s.y = cy + Math.sin(angle) * distFromCenter;
        s.px = s.x; s.py = s.y;
        s.z = rand(0.6, 1.0);
        s.speed = rand(0.3, 1.8);
      }
    }
  }

  function draw() {
    // Ligeramente transparente para trails
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.fillRect(0, 0, w, h);

    for (const s of stars) {
      const size = Math.max(0.6, (1.8 - s.z) * 2.2);
      const alpha = Math.max(0.06, (1.4 - s.z) * 0.9);
      // stroke streak
      const grad = ctx.createLinearGradient(s.px, s.py, s.x, s.y);
      grad.addColorStop(0, `rgba(10,200,220,${Math.min(0.25, alpha * 0.6)})`);
      grad.addColorStop(1, `rgba(240,255,255,${alpha})`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = Math.max(1, size * 0.9);
      ctx.beginPath();
      ctx.moveTo(s.px, s.py);
      ctx.lineTo(s.x, s.y);
      ctx.stroke();
      // head
      ctx.fillStyle = `rgba(200,255,255,${alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, Math.max(0.6, size * 0.6), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function loop(now) {
    const dt = Math.min(60, now - lastTime);
    update(dt / 16.66);
    draw();
    lastTime = now;
    requestAnimationFrame(loop);
  }

  let lastTime = performance.now();
  init();
  requestAnimationFrame(loop);
})();
