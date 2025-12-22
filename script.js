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