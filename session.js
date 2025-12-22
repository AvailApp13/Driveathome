const params = new URLSearchParams(window.location.search);
const minutes = parseInt(params.get("time"), 10) || 5;

let seconds = minutes * 60;
const timeEl = document.getElementById("time");

function updateTimer() {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  timeEl.textContent = `${m}:${s}`;
}

updateTimer();

setInterval(() => {
  seconds--;
  updateTimer();

  if (seconds <= 0) {
    alert("Session finished");
    window.location.href = "index.html";
  }
}, 1000);
