
const API = (window.DRIVEATHOME_CONFIG?.API_BASE || "").replace(/\/$/, "");
async function sendFeedback() {
  const name = document.getElementById("name").value.trim();
  const message = document.getElementById("message").value.trim();
  const msg = document.getElementById("feedbackMsg");
  if (!message) {
    msg.textContent = "Please write a short message.";
    return;
  }
  try {
    const res = await fetch(`${API}/api/feedback`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ nickname: name, message })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Could not send feedback");
    msg.textContent = "Feedback received. Thank you.";
  } catch (e) {
    msg.textContent = e.message;
  }
}
