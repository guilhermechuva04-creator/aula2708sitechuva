const form = document.getElementById("loginForm");
const msg = document.getElementById("loginMessage");
const saved = localStorage.getItem("gc_username");
if (saved) {
  document.getElementById("login").value = saved;
  document.getElementById("remember").checked = true;
}
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "Validando acesso...";
  msg.className = "message";
  const username = document.getElementById("login").value.trim();
  const password = document.getElementById("senha").value;
  try {
    const r = await fetch("/api/login", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username,password})});
    const data = await r.json();
    if (!r.ok) throw new Error(data.error);
    if (document.getElementById("remember").checked) localStorage.setItem("gc_username", username);
    else localStorage.removeItem("gc_username");
    sessionStorage.setItem("gc_user", JSON.stringify(data.user));
    location.href = "/dashboard.html";
  } catch(err) {
    msg.textContent = err.message || "Não foi possível entrar.";
    msg.className = "message error";
  }
});
document.getElementById("forgot").addEventListener("click", e => {
  e.preventDefault();
  alert("Demonstração acadêmica: solicite a redefinição ao administrador do sistema.");
});