let projects=[];
const table=document.getElementById("projectsTable"), search=document.getElementById("search"), modal=document.getElementById("modal");
async function load(){projects=await (await fetch("/api/projects")).json(); render(projects);}
function render(list){table.innerHTML=list.map(p=>`<tr><td><strong>${esc(p.name)}</strong><br><small class="muted">${p.start_date||"Sem data"} → ${p.end_date||"Sem previsão"}</small></td><td>${esc(p.client)}</td><td>${esc(p.location)}</td><td><span class="badge">${esc(p.status)}</span></td><td><div class="progress"><i style="width:${p.progress}%"></i></div><small>${p.progress}%</small></td><td class="actions"><button onclick="del(${p.id})" class="danger">Excluir</button></td></tr>`).join("")||`<tr><td colspan="6">Nenhuma obra encontrada.</td></tr>`}
search.oninput=()=>render(projects.filter(p=>(p.name+" "+p.client+" "+p.location).toLowerCase().includes(search.value.toLowerCase())));
document.getElementById("openModal").onclick=()=>modal.classList.add("show");
document.getElementById("closeModal").onclick=()=>modal.classList.remove("show");
modal.onclick=e=>{if(e.target===modal)modal.classList.remove("show")};
document.getElementById("projectForm").onsubmit=async e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.target));data.progress=Number(data.progress);await fetch("/api/projects",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});e.target.reset();modal.classList.remove("show");load();};
async function del(id){if(confirm("Excluir esta obra?")){await fetch("/api/projects/"+id,{method:"DELETE"});load();}}
load();