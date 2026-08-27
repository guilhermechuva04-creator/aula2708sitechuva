const user = JSON.parse(sessionStorage.getItem("gc_user") || "null");
if (!user && !location.pathname.endsWith("index.html") && location.pathname !== "/") location.href="/";
const logout = document.getElementById("logout");
if (logout) logout.onclick = () => { sessionStorage.removeItem("gc_user"); location.href="/"; };
const userName = document.getElementById("userName");
if (userName && user) userName.textContent = user.name;
const money = n => Number(n||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const esc = s => String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));