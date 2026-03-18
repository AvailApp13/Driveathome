
const API = (window.DRIVEATHOME_CONFIG?.API_BASE || "").replace(/\/$/, "");
let robotState = null;

function goPayment(minutes) {
  const nickname = document.getElementById("nickname")?.value?.trim() || "";
  const q = new URLSearchParams({ minutes: String(minutes), nickname });
  location.href = `payment.html?${q.toString()}`;
}

function showInfo(title, text) {
  document.getElementById("infoTitle").textContent = title;
  document.getElementById("infoText").textContent = text;
  document.getElementById("infoOverlay").style.display = "flex";
}
function closeInfo() {
  document.getElementById("infoOverlay").style.display = "none";
}

async function loadStatus() {
  try {
    const res = await fetch(`${API}/api/status`, { cache: "no-store" });
    const data = await res.json();
    robotState = data;
    applyStatus(data);
  } catch (e) {
    applyStatus({ state: "offline" });
  }
}
function applyStatus(data) {
  const dot = document.getElementById("statusDot");
  const label = document.getElementById("statusLabel");
  const countdown = document.getElementById("statusCountdown");
  const buy5 = document.getElementById("buy5Btn");
  const buy10 = document.getElementById("buy10Btn");
  if (!dot || !label) return;
  dot.className = "dot";
  countdown.textContent = "";
  if (data.state === "ready") {
    dot.classList.add("green");
    label.textContent = "Ready · robot online";
    buy5.disabled = false; buy10.disabled = false;
    buy5.className = "primary"; buy10.className = "primary";
  } else if (data.state === "holding") {
    dot.classList.add("yellow");
    label.textContent = "Hold · someone is starting";
    buy5.disabled = true; buy10.disabled = true;
    buy5.className = "primary yellow"; buy10.className = "primary yellow";
  } else if (data.state === "busy") {
    dot.classList.add("red");
    label.textContent = "Busy · someone is playing";
    if (data.seconds_left != null) {
      countdown.textContent = `~${formatTime(data.seconds_left)} left`;
    }
    buy5.disabled = true; buy10.disabled = true;
    buy5.className = "primary red"; buy10.className = "primary red";
  } else {
    dot.classList.add("red");
    label.textContent = "Offline · robot unavailable";
    buy5.disabled = true; buy10.disabled = true;
    buy5.className = "primary red"; buy10.className = "primary red";
  }
}
function formatTime(total) {
  total = Math.max(0, Math.floor(total));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
async function redeemPromo() {
  const nickname = document.getElementById("nickname").value.trim();
  const code = document.getElementById("promoCode").value.trim();
  const msg = document.getElementById("promoMsg");
  msg.textContent = "";
  if (!nickname || !code) {
    msg.textContent = "Enter nickname and promo code.";
    return;
  }
  try {
    const res = await fetch(`${API}/api/promo/redeem`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname, code })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Promo failed");
    location.href = `session.html?session=${encodeURIComponent(data.session_id)}`;
  } catch (e) {
    msg.textContent = e.message;
  }
}
loadStatus();
setInterval(loadStatus, 3000);
