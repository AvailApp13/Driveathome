
const API = (window.DRIVEATHOME_CONFIG?.API_BASE || "").replace(/\/$/, "");
const params = new URLSearchParams(location.search);
const sessionId = params.get("session");

const timerEl = document.getElementById("timer");
const sessionDot = document.getElementById("sessionDot");
const sessionStatus = document.getElementById("sessionStatus");
const countdownEl = document.getElementById("countdown");
const videoFeed = document.getElementById("videoFeed");
const videoFallback = document.getElementById("videoFallback");
const startButton = document.getElementById("startButton");
const endButton = document.getElementById("endButton");
const fireButtons = [document.getElementById("fireSmall"), document.getElementById("fireLarge")];

let ws = null;
let sessionData = null;
let timerInterval = null;
let countInterval = null;
let controlsEnabled = false;
let moveJoy = null;
let aimJoy = null;

function setStatus(state, text) {
  sessionDot.className = "dot";
  if (state === "ready") sessionDot.classList.add("green");
  else if (state === "holding") sessionDot.classList.add("yellow");
  else sessionDot.classList.add("red");
  sessionStatus.textContent = text;
}

function formatTime(total) {
  total = Math.max(0, Math.floor(total));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

async function loadSession() {
  if (!sessionId) {
    setStatus("offline", "Missing session");
    return;
  }
  try {
    const res = await fetch(`${API}/api/session/${encodeURIComponent(sessionId)}`, { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Session not found");
    sessionData = data;
    applySession();
  } catch (e) {
    setStatus("offline", e.message);
  }
}

function applySession() {
  if (!sessionData) return;
  if (sessionData.status === "pending") {
    timerEl.textContent = "00:10";
    setStatus("holding", "Ready to start");
  } else if (sessionData.status === "countdown") {
    countdownEl.style.display = "flex";
    startCountdown(sessionData.countdown_left || 10, true);
    setStatus("holding", "Starting");
  } else if (sessionData.status === "active") {
    countdownEl.style.display = "none";
    controlsEnabled = true;
    setStatus("ready", "Live");
    startMainTimer();
  } else {
    controlsEnabled = false;
    setStatus("offline", "Session ended");
    timerEl.textContent = "00:00";
    setTimeout(() => {
      location.href = "feedback.html";
    }, 1800);
  }
}

async function startSession() {
  try {
    const res = await fetch(`${API}/api/session/start`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ session_id: sessionId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Could not start");
    sessionData = data;
    countdownEl.style.display = "flex";
    startCountdown(10, false);
  } catch (e) {
    setStatus("offline", e.message);
  }
}

function startCountdown(startAt, passive) {
  clearInterval(countInterval);
  let left = Math.max(0, Math.floor(startAt));
  countdownEl.textContent = left;
  timerEl.textContent = `00:${String(left).padStart(2,"0")}`;
  countInterval = setInterval(() => {
    left -= 1;
    countdownEl.textContent = Math.max(0, left);
    timerEl.textContent = `00:${String(Math.max(0,left)).padStart(2,"0")}`;
    if (left <= 0) {
      clearInterval(countInterval);
      countdownEl.style.display = "none";
      if (!passive) {
        // backend timer will flip to active; we just poll sooner
        setTimeout(loadSession, 700);
      }
    }
  }, 1000);
}

function startMainTimer() {
  clearInterval(timerInterval);
  const endTs = sessionData.ends_at_ts || 0;
  const tick = () => {
    const left = Math.max(0, Math.floor(endTs - Date.now() / 1000));
    timerEl.textContent = formatTime(left);
    if (left <= 0) {
      clearInterval(timerInterval);
      controlsEnabled = false;
      setStatus("offline", "Session ended");
      location.href = "feedback.html";
    }
  };
  tick();
  timerInterval = setInterval(tick, 1000);
}

function wsUrl() {
  const u = new URL(API);
  u.protocol = u.protocol === "https:" ? "wss:" : "ws:";
  u.pathname = `/ws/control/${encodeURIComponent(sessionId)}`;
  return u.toString();
}

function connectWs() {
  if (!sessionId) return;
  try {
    ws = new WebSocket(wsUrl());
    ws.onopen = () => {};
    ws.onclose = () => setTimeout(connectWs, 2000);
    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if (data.type === "session") {
          sessionData = { ...sessionData, ...data.payload };
          applySession();
        }
      } catch {}
    };
  } catch {}
}

class VirtualJoystick {
  constructor(el, type) {
    this.el = el;
    this.stick = el.querySelector(".stick");
    this.type = type;
    this.active = false;
    this.pointerId = null;
    this.cx = 0;
    this.cy = 0;
    this.max = el.clientWidth / 2 - 26;
    this.current = { x: 0, y: 0 };
    this.loop = null;
    el.addEventListener("pointerdown", this.onDown.bind(this));
    window.addEventListener("pointermove", this.onMove.bind(this));
    window.addEventListener("pointerup", this.onUp.bind(this));
    window.addEventListener("pointercancel", this.onUp.bind(this));
  }
  onDown(e) {
    e.preventDefault();
    this.active = true;
    this.pointerId = e.pointerId;
    const rect = this.el.getBoundingClientRect();
    this.cx = rect.left + rect.width / 2;
    this.cy = rect.top + rect.height / 2;
    this.updateFromEvent(e);
    if (!this.loop) this.loop = setInterval(() => this.emit(), this.type === "aim" ? 50 : 100);
  }
  onMove(e) {
    if (!this.active || e.pointerId !== this.pointerId) return;
    this.updateFromEvent(e);
  }
  onUp(e) {
    if (!this.active || e.pointerId !== this.pointerId) return;
    this.active = false;
    this.pointerId = null;
    this.current = { x: 0, y: 0 };
    this.stick.style.transform = "translate(0px,0px)";
    this.emit(true);
    clearInterval(this.loop); this.loop = null;
  }
  updateFromEvent(e) {
    const dx = e.clientX - this.cx;
    const dy = e.clientY - this.cy;
    const mag = Math.max(1, Math.hypot(dx, dy));
    const clamped = Math.min(this.max, mag);
    const x = (dx / mag) * clamped;
    const y = (dy / mag) * clamped;
    this.current = { x: x / this.max, y: y / this.max };
    this.stick.style.transform = `translate(${x}px,${y}px)`;
  }
  emit(forceStop = false) {
    if (!ws || ws.readyState !== 1 || !controlsEnabled) return;
    if (this.type === "move") {
      ws.send(JSON.stringify({ type: "move", x: forceStop ? 0 : this.current.x, y: forceStop ? 0 : this.current.y }));
    } else {
      ws.send(JSON.stringify({ type: "aim", x: forceStop ? 0 : this.current.x, y: forceStop ? 0 : this.current.y }));
    }
  }
}

function bindFire() {
  const down = () => {
    if (!ws || ws.readyState !== 1 || !controlsEnabled) return;
    ws.send(JSON.stringify({ type: "fire", active: true }));
  };
  const up = () => {
    if (!ws || ws.readyState !== 1) return;
    ws.send(JSON.stringify({ type: "fire", active: false }));
  };
  for (const btn of fireButtons) {
    ["pointerdown", "mousedown", "touchstart"].forEach(evt => btn.addEventListener(evt, (e) => { e.preventDefault(); down(); }));
    ["pointerup", "pointercancel", "mouseup", "mouseleave", "touchend"].forEach(evt => btn.addEventListener(evt, (e) => { e.preventDefault(); up(); }));
  }
}

videoFeed.src = `${API}/video.mjpg`;
videoFeed.onload = () => { videoFallback.style.display = "none"; };
videoFeed.onerror = () => { videoFallback.style.display = "block"; };

startButton.addEventListener("click", startSession);
endButton.addEventListener("click", async () => {
  await fetch(`${API}/api/session/end`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ session_id: sessionId })
  }).catch(() => {});
  location.href = "feedback.html";
});

loadSession();
setInterval(loadSession, 2000);
connectWs();
moveJoy = new VirtualJoystick(document.getElementById("moveJoystick"), "move");
aimJoy = new VirtualJoystick(document.getElementById("aimJoystick"), "aim");
bindFire();
