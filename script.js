const startBtn = document.getElementById("startBtn");
const timer = document.getElementById("timer");
const timeValue = document.getElementById("timeValue");
const statusText = document.getElementById("status");

let duration = 5 * 60; // 5 минут
let countdown;

function startSession() {
  startBtn.disabled = true;
  startBtn.textContent = "IN PROGRESS";

  timer.classList.remove("hidden");
  statusText.classList.remove("hidden");

  let timeLeft = duration;
  updateTimer(timeLeft);

  countdown = setInterval(() => {
    timeLeft--;
    updateTimer(timeLeft);

    if (timeLeft <= 0) {
      endSession();
    }
  }, 1000);
}

function updateTimer(seconds) {
  const min = String(Math.floor(seconds / 60)).padStart(2, "0");
  const sec = String(seconds % 60).padStart(2, "0");
  timeValue.textContent = `${min}:${sec}`;
}

function endSession() {
  clearInterval(countdown);
  startBtn.disabled = false;
  startBtn.textContent = "START AGAIN";
  statusText.textContent = "Session ended";
}

startBtn.addEventListener("click", startSession);
