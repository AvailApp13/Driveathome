
const API = (window.DRIVEATHOME_CONFIG?.API_BASE || "").replace(/\/$/, "");
async function createTestSession() {
  const params = new URLSearchParams(location.search);
  const minutes = parseInt(params.get("minutes") || "5", 10);
  const nickname = (document.getElementById("nickname").value.trim() || params.get("nickname") || "").trim();
  const msg = document.getElementById("paymentMsg");
  if (!nickname) {
    msg.textContent = "Please enter your nickname.";
    return;
  }
  try {
    const res = await fetch(`${API}/api/session/create`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ nickname, minutes, source: "test_payment" })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Could not create session");
    location.href = `session.html?session=${encodeURIComponent(data.session_id)}`;
  } catch (e) {
    msg.textContent = e.message;
  }
}
