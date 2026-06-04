const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const SIZE = 320;
const SCALE = 2;

const W = SIZE;
const H = 440;
const WIN_W = SIZE / SCALE;
const WIN_H = H / SCALE;

let petX = W / 2;
let petY = H / 2;

let mouseX = W / 2;
let mouseY = H / 2;
let mouseInside = false;
let mouseDown = false;

let blinkTimer = 0;
let isBlinking = false;
let blinkPhase = 0;

let bouncePhase = 0;
let mood = 'happy';
let moodTimer = 0;

let walkTimer = 0;
let isWalking = false;
let walkTargetX = W / 2;
let walkTargetY = H / 2;

let hearts = [];
let sparkles = [];
let showTime = false;
let timeFade = 0;
let clickCount = 0;
let bubbleTexts = [];

let tailWag = 0;

const screenSize = window.electronAPI.getScreenSize();
const SCREEN_W = screenSize.width;
const SCREEN_H = screenSize.height;

let windowX = Math.round(SCREEN_W / 2 - WIN_W / 2);
let windowY = Math.round(SCREEN_H / 2 - WIN_H / 2);

const SCREEN_MARGIN = 40;
const CANVAS_MARGIN = SCREEN_MARGIN * SCALE;

const COLORS = {
  body: '#6C63FF',
  bodyLight: '#8B83FF',
  bodyDark: '#4A42CC',
  cheek: '#FF9E9E',
  eye: '#2D2D2D',
  eyeWhite: '#FFFFFF',
};

const MOOD_COLORS = {
  happy: { body: '#6C63FF', light: '#8B83FF', dark: '#4A42CC' },
  sleepy: { body: '#A0A0C0', light: '#C0C0D8', dark: '#8080A8' },
  excited: { body: '#FF6B6B', light: '#FF8E8E', dark: '#CC4444' },
  curious: { body: '#4ECDC4', light: '#7EDDD6', dark: '#2EADA4' },
};

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}

function dist(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

function petScreenPos() {
  return {
    x: windowX + petX / SCALE,
    y: windowY + petY / SCALE,
  };
}

function getTimeString() {
  const now = new Date();
  const h = now.getHours().toString().padStart(2, '0');
  const m = now.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return '¡Buenos días!';
  if (h < 18) return '¡Buenas tardes!';
  return '¡Buenas noches!';
}

function getFunMessage() {
  const msgs = [
    '¿Tienes hambre?', 'Me gusta mirarte', '¡Qué bonito día!',
    'Sé feliz :)', 'Tú puedes', '¿Un café?',
    'Tick tock...', '¡Hola!', '¿Qué miras?',
    'Soy blandito', 'Haz clic de nuevo', '¡Otra vez!',
  ];
  return msgs[randInt(0, msgs.length - 1)];
}

function addHeart(x, y) {
  hearts.push({ x, y, vx: rand(-2, 2), vy: rand(-4, -1), life: 1, size: rand(6, 14) });
}

function addSparkle(x, y) {
  sparkles.push({
    x, y, vx: rand(-3, 3), vy: rand(-3, 3), life: 1,
    size: rand(3, 7), angle: rand(0, Math.PI * 2), spin: rand(-0.1, 0.1),
  });
}

function drawBlob(cx, cy, radius, squash) {
  const s = squash || 1;
  ctx.save();
  ctx.translate(cx, cy + radius * (1 - s) * 0.3);
  ctx.scale(1, s);
  ctx.beginPath();
  for (let i = 0; i <= 32; i++) {
    const a = (i / 32) * Math.PI * 2;
    const px = radius * Math.cos(a);
    const py = radius * Math.sin(a) * 0.85 + radius * 0.15 * Math.sin(a * 2) * 0.1;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.restore();
}

function enforceBoundaries() {
  const pos = petScreenPos();

  if (pos.x < SCREEN_MARGIN) {
    windowX = SCREEN_MARGIN - petX / SCALE;
  } else if (pos.x > SCREEN_W - SCREEN_MARGIN) {
    windowX = SCREEN_W - SCREEN_MARGIN - petX / SCALE;
  }
  if (pos.y < SCREEN_MARGIN) {
    windowY = SCREEN_MARGIN - petY / SCALE;
  } else if (pos.y > SCREEN_H - SCREEN_MARGIN) {
    windowY = SCREEN_H - SCREEN_MARGIN - petY / SCALE;
  }

  windowX = Math.round(clamp(windowX, 0, SCREEN_W - WIN_W));
  windowY = Math.round(clamp(windowY, 0, SCREEN_H - WIN_H));
}

function drawCharacter(time) {
  const bounce = Math.sin(bouncePhase) * 3;
  const eyeOpen = isBlinking ? Math.max(0, Math.sin(blinkPhase * Math.PI)) : 1;

  COLORS.body = MOOD_COLORS[mood].body;
  COLORS.bodyLight = MOOD_COLORS[mood].light;
  COLORS.bodyDark = MOOD_COLORS[mood].dark;

  const bodyY = H / 2 + 10 + bounce;
  const bodyX = W / 2;

  const distToMouse = dist(bodyX, bodyY, mouseX, mouseY);
  const isNearMouse = distToMouse < 120 && mouseInside;
  const squash = isWalking ? 0.92 + Math.sin(bouncePhase * 2) * 0.05 : 1;

  if (isNearMouse && !isWalking) {
    const angle = Math.atan2(mouseY - bodyY, mouseX - bodyX);
    const tx = bodyX + Math.cos(angle) * 8;
    const ty = bodyY + Math.sin(angle) * 8;
    petX = lerp(petX, tx, 0.05);
    petY = lerp(petY, ty, 0.05);
  } else if (!isWalking) {
    petX = lerp(petX, bodyX, 0.05);
    petY = lerp(petY, bodyY, 0.05);
  }

  const dx = petX;
  const dy = petY;

  ctx.save();
  ctx.translate(dx, dy);

  const r = 38;
  drawBlob(0, 0, r, squash);

  const grad = ctx.createRadialGradient(-10, -15, 5, 0, 0, r);
  grad.addColorStop(0, COLORS.bodyLight);
  grad.addColorStop(0.7, COLORS.body);
  grad.addColorStop(1, COLORS.bodyDark);
  ctx.fillStyle = grad;
  ctx.fill();

  tailWag += 0.08;
  const tb = Math.sin(tailWag) * 0.4 + 0.3;
  ctx.save();
  ctx.translate(-r * 0.6, -r * 0.2);
  ctx.rotate(-0.3 + Math.sin(tailWag) * 0.2);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-18, -12 + tb * 8, -5, -28 + tb * 5);
  ctx.strokeStyle = COLORS.bodyDark;
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.restore();

  if (mood !== 'sleepy') {
    for (let side = -1; side <= 1; side += 2) {
      const ex = side * 14;
      const ey = -8;

      let lookX = 0, lookY = 0;
      if (mouseInside) {
        const mdx = mouseX - (dx + ex);
        const mdy = mouseY - (dy + ey);
        const md = Math.hypot(mdx, mdy);
        if (md > 0) {
          const f = Math.min(1, 80 / md);
          lookX = (mdx / md) * 5 * f;
          lookY = (mdy / md) * 5 * f;
        }
      }

      ctx.fillStyle = COLORS.eyeWhite;
      ctx.beginPath();
      ctx.ellipse(ex, ey, 10, 10 * eyeOpen, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = COLORS.eye;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (eyeOpen > 0.1) {
        ctx.fillStyle = COLORS.eye;
        ctx.beginPath();
        ctx.arc(ex + lookX, ey + lookY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(ex + lookX - 2, ey + lookY - 2, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (mood === 'happy' || mood === 'excited') {
      ctx.fillStyle = COLORS.cheek;
      ctx.globalAlpha = 0.5 + Math.sin(bouncePhase * 0.5) * 0.15;
      for (let side = -1; side <= 1; side += 2) {
        ctx.beginPath();
        ctx.ellipse(side * 16, 6, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    if (mood === 'happy' || mood === 'excited') {
      ctx.beginPath();
      ctx.arc(0, 8, 6, 0.1, Math.PI - 0.1);
      ctx.strokeStyle = COLORS.eye;
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (mood === 'curious') {
      ctx.beginPath();
      ctx.ellipse(0, 6, 4, 3, 0, 0, Math.PI * 2);
      ctx.strokeStyle = COLORS.eye;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  } else {
    ctx.fillStyle = COLORS.eye;
    ctx.globalAlpha = 0.4;
    for (let side = -1; side <= 1; side += 2) {
      ctx.beginPath();
      ctx.arc(side * 12, -6, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.moveTo(-4, 8);
    ctx.lineTo(4, 8);
    ctx.strokeStyle = COLORS.eye;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  ctx.restore();

  hearts = hearts.filter(h => {
    h.x += h.vx; h.y += h.vy; h.vy += 0.1; h.life -= 0.015;
    ctx.save();
    ctx.globalAlpha = h.life;
    ctx.translate(h.x, h.y);
    ctx.fillStyle = '#FF6B8A';
    ctx.beginPath();
    const hs = h.size;
    ctx.moveTo(0, hs * 0.3);
    ctx.bezierCurveTo(-hs * 0.5, -hs * 0.3, -hs, hs * 0.1, 0, hs * 0.7);
    ctx.bezierCurveTo(hs, hs * 0.1, hs * 0.5, -hs * 0.3, 0, hs * 0.3);
    ctx.fill();
    ctx.restore();
    return h.life > 0;
  });

  sparkles = sparkles.filter(s => {
    s.x += s.vx; s.y += s.vy; s.vy += 0.05; s.life -= 0.02;
    s.angle += s.spin;
    ctx.save();
    ctx.globalAlpha = s.life;
    ctx.translate(s.x, s.y);
    ctx.rotate(s.angle);
    ctx.fillStyle = '#FFE66D';
    ctx.shadowColor = '#FFE66D';
    ctx.shadowBlur = 8;
    const ss = s.size;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const r2 = i % 2 === 0 ? ss : ss * 0.3;
      i === 0 ? ctx.moveTo(Math.cos(a) * r2, Math.sin(a) * r2) : ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2);
    }
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
    return s.life > 0;
  });

  if (showTime || timeFade > 0) {
    if (showTime) timeFade = Math.min(1, timeFade + 0.03);
    else timeFade = Math.max(0, timeFade - 0.03);

    const texts = bubbleTexts;

    ctx.save();
    ctx.globalAlpha = timeFade;

    ctx.font = 'bold 22px "Segoe UI", Arial, sans-serif';
    let maxW = 0;
    for (const t of texts) maxW = Math.max(maxW, ctx.measureText(t).width);

    const pad = 14;
    const bw = maxW + pad * 2;
    const bh = texts.length * 32 + pad * 2;
    const bubbleBelow = dy + 45 + bh < H - 10;
    const bx = dx;
    const by = bubbleBelow ? dy + 45 : dy - 30 - bh;

    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.shadowColor = 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.roundRect(bx - bw / 2, by, bw, bh, 12);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    texts.forEach((t, i) => {
      ctx.fillText(t, bx, by + bh / 2 + (i - (texts.length - 1) / 2) * 32);
    });

    ctx.beginPath();
    const tipY = bubbleBelow ? by : by + bh;
    const anchorY = bubbleBelow ? dy + 35 : dy - 25;
    ctx.moveTo(bx - 8, tipY);
    ctx.lineTo(dx, anchorY);
    ctx.lineTo(bx + 8, tipY);
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.fill();

    ctx.restore();
  }
}

function updateState() {
  bouncePhase += 0.04;

  blinkTimer++;
  if (isBlinking) {
    blinkPhase += 0.15;
    if (blinkPhase >= 1) {
      isBlinking = false; blinkPhase = 0; blinkTimer = 0;
    }
  } else if (blinkTimer > 120 + randInt(0, 120)) {
    isBlinking = true; blinkPhase = 0;
  }

  moodTimer++;
  if (moodTimer > 600) {
    const moods = Object.keys(MOOD_COLORS);
    let nm;
    do { nm = moods[randInt(0, moods.length - 1)]; } while (nm === mood);
    mood = nm;
    moodTimer = 0;
  }

  if (!mouseDown && !isWalking) {
    walkTimer++;
    if (walkTimer > 300 + randInt(0, 300)) {
      walkTargetX = clamp(W / 2 + rand(-W / 3, W / 3), CANVAS_MARGIN, W - CANVAS_MARGIN);
      walkTargetY = clamp(H / 2 + rand(-H / 3, H / 3), CANVAS_MARGIN, H - CANVAS_MARGIN);
      if (dist(W / 2, H / 2 + 10, walkTargetX, walkTargetY) > 30) {
        isWalking = true;
      }
      walkTimer = 0;
    }
  }

  if (isWalking) {
    const dx = walkTargetX - petX;
    const dy = walkTargetY - petY;
    const d = Math.hypot(dx, dy);
    if (d < 5) {
      isWalking = false;
      petX = walkTargetX;
      petY = walkTargetY;
    } else {
      const speed = 1.5;
      petX += (dx / d) * speed;
      petY += (dy / d) * speed;
    }
  }

  enforceBoundaries();
  window.electronAPI.moveWindow(windowX, windowY);
}

function draw() {
  ctx.clearRect(0, 0, W, H);

  const grad = ctx.createRadialGradient(W / 2, H / 2, 10, W / 2, H / 2, W * 0.7);
  grad.addColorStop(0, 'rgba(200,200,255,0.03)');
  grad.addColorStop(1, 'rgba(200,200,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  drawCharacter();
}

function gameLoop(time) {
  updateState();
  draw();
  requestAnimationFrame(gameLoop);
}

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = W / rect.width;
  const scaleY = H / rect.height;
  mouseX = (e.clientX - rect.left) * scaleX;
  mouseY = (e.clientY - rect.top) * scaleY;
  mouseInside = true;

  if (mouseDown && !isWalking) {
    petX = lerp(petX, mouseX, 0.1);
    petY = lerp(petY, mouseY, 0.1);
    if (e.movementX) windowX += e.movementX;
    if (e.movementY) windowY += e.movementY;
    enforceBoundaries();
    window.electronAPI.moveWindow(windowX, windowY);
  }
});

canvas.addEventListener('mouseleave', () => {
  mouseInside = false;
});

canvas.addEventListener('mousedown', (e) => {
  if (e.button === 2) return;
  if (updateReady) {
    window.electronAPI.installUpdate();
    return;
  }
  mouseDown = true;
  clickCount++;
  if (showTime) {
    bubbleTexts = [getTimeString(), getGreeting()];
    if (clickCount >= 3) bubbleTexts.push(getFunMessage());
  } else {
    showTime = true;
    bubbleTexts = [getTimeString(), getGreeting()];
    if (clickCount >= 3) bubbleTexts.push(getFunMessage());
  }
  for (let i = 0; i < 8; i++) addHeart(petX + rand(-20, 20), petY + rand(-20, 20));
  for (let i = 0; i < 12; i++) addSparkle(petX + rand(-30, 30), petY + rand(-30, 30));
  mood = 'excited';
  moodTimer = 0;
  isWalking = false;
});

canvas.addEventListener('mouseup', () => {
  mouseDown = false;
  setTimeout(() => {
    if (!mouseDown) {
      showTime = false;
      if (mood === 'excited') mood = 'happy';
    }
  }, 8000);
});

canvas.addEventListener('dblclick', () => {
  for (let i = 0; i < 20; i++) addHeart(petX + rand(-40, 40), petY + rand(-30, 30));
  for (let i = 0; i < 25; i++) addSparkle(petX + rand(-50, 50), petY + rand(-40, 40));
  mood = 'excited';
  moodTimer = 0;
});

canvas.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  const menu = document.getElementById('ctxmenu');
  const rect = canvas.getBoundingClientRect();
  menu.style.display = 'block';
  menu.style.left = Math.max(0, Math.round((rect.width - menu.offsetWidth) / 2)) + 'px';
  menu.style.top = Math.max(0, Math.round((rect.height - menu.offsetHeight) / 2)) + 'px';
});

document.addEventListener('click', (e) => {
  const menu = document.getElementById('ctxmenu');
  if (menu.style.display === 'block' && !menu.contains(e.target)) {
    menu.style.display = 'none';
  }
});

document.getElementById('ctxrestart').addEventListener('click', () => {
  document.getElementById('ctxmenu').style.display = 'none';
  window.electronAPI.restartApp();
});

document.getElementById('ctxclose').addEventListener('click', () => {
  document.getElementById('ctxmenu').style.display = 'none';
  window.electronAPI.closeApp();
});

let updateReady = false;

window.electronAPI.onUpdateAvailable(() => {
  showTime = true;
  if (clickCount >= 3) {
    bubbleTexts = ['📦 Actualizacion', 'Nueva version disponible', 'Descargando...'];
  } else {
    bubbleTexts = ['📦 Nueva version', 'Descargando...'];
  }
});

window.electronAPI.onUpdateDownloaded(() => {
  updateReady = true;
  showTime = true;
  bubbleTexts = ['📦 Actualizacion lista', 'Haz clic para instalar'];
});

gameLoop(0);
