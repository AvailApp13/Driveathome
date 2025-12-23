function startSession(minutes) {
  // ТВОЯ СУЩЕСТВУЮЩАЯ ЛОГИКА
  // например:
  window.location.href = "session.html?time=" + minutes;
}

/* INFO POPUP */
function openInfo(minutes) {
  const overlay = document.getElementById("infoOverlay");
  const text = document.getElementById("infoText");

  if (!overlay || !text) return;

  if (minutes === 5) {
    text.innerHTML = `
      • 5 minutes live control<br>
      • 50 shots available<br>
      • Live video stream<br>
      • Full movement control
    `;
  } else {
    text.innerHTML = `
      • 10 minutes live control<br>
      • 100 shots available<br>
      • Live video stream<br>
      • Full movement control
    `;
  }

  overlay.style.display = "flex";
}

function closeInfo() {
  document.getElementById("infoOverlay").style.display = "none";
}
/* ===========================
   PROMO CODE LOGIC (SAFE)
   =========================== */

function applyPromoCode() {
  const input = document.getElementById("promoInput");
  const message = document.getElementById("promoMessage");

  if (!input) return;

  const code = input.value.trim();
  if (!code) {
    if (message) message.textContent = "Enter promo code";
    return;
  }

  fetch("/promo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ code })
  })
    .then(res => res.json())
    .then(data => {
      if (!data.ok) {
        if (message) message.textContent = "Invalid or used promo code";
        return;
      }

      if (message) {
        message.textContent = `Promo accepted: ${data.minutes} minutes`;
      }

      // 🔥 ВАЖНО: используем ТВОЮ функцию
      setTimeout(() => {
        startSession(data.minutes);
      }, 800);
    })
    .catch(() => {
      if (message) message.textContent = "Server error";
    });
}