// ===== START SESSION (НЕ МЕНЯЕМ ЛОГИКУ) =====
function startSession(minutes) {
  const confirmStart = confirm(
    `TEST MODE\nСтарт сессии: ${minutes} минут`
  );

  if (!confirmStart) return;

  window.location.href = `session.html?time=${minutes}`;
}

// ===== POPUP LOGIC =====
const modal = document.getElementById("info-modal");
const modalTitle = document.getElementById("modal-title");
const modalText = document.getElementById("modal-text");

function openInfo(type) {
  if (type === "5") {
    modalTitle.innerText = "Тариф: 5 минут";
    modalText.innerHTML = `
      ⏱ <b>Длительность:</b> 5 минут<br><br>
      🔫 <b>Выстрелы:</b> 50<br><br>
      🎮 <b>Управление:</b><br>
      Полный контроль над RoboMaster S1 в реальном времени<br><br>
      📹 <b>Видео:</b><br>
      Онлайн-видеопоток с камеры робота<br><br>
      👤 <b>Доступ:</b><br>
      Один пользователь — один робот<br><br>
      ⚠️ <b>Важно:</b><br>
      После окончания времени управление автоматически отключается
    `;
  }

  if (type === "10") {
    modalTitle.innerText = "Тариф: 10 минут";
    modalText.innerHTML = `
      ⏱ <b>Длительность:</b> 10 минут<br><br>
      🔫 <b>Выстрелы:</b> 100<br><br>
      🎮 <b>Управление:</b><br>
      Полный контроль над RoboMaster S1 в реальном времени<br><br>
      📹 <b>Видео:</b><br>
      Онлайн-видеопоток с камеры робота<br><br>
      👤 <b>Доступ:</b><br>
      Один пользователь — один робот<br><br>
      ⚠️ <b>Важно:</b><br>
      После окончания времени управление автоматически отключается
    `;
  }

  modal.classList.remove("hidden");
}

// Закрытие по кнопке
function closeInfo() {
  modal.classList.add("hidden");
}

// Закрытие по клику на фон
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    closeInfo();
  }
});