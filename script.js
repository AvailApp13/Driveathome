function startSession(minutes) {
  const confirmStart = confirm(
    `TEST MODE\nСтарт сессии: ${minutes} минут`
  );

  if (!confirmStart) return;

  // Переход на страницу сессии
  window.location.href = `session.html?time=${minutes}`;
}