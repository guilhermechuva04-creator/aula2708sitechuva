const express = require("express");
const path = require("path");
const Database = require("better-sqlite3");

const app = express();
const PORT = process.env.PORT || 3000;
const db = new Database(path.join(__dirname, "database.sqlite"));

db.pragma("journal_mode = WAL");
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  client TEXT NOT NULL,
  location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Em andamento',
  progress INTEGER NOT NULL DEFAULT 0,
  start_date TEXT,
  end_date TEXT
);
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  responsible TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pendente',
  due_date TEXT,
  FOREIGN KEY(project_id) REFERENCES projects(id)
);
CREATE TABLE IF NOT EXISTS expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  amount REAL NOT NULL,
  expense_date TEXT NOT NULL,
  FOREIGN KEY(project_id) REFERENCES projects(id)
);
`);

const user = db.prepare("SELECT id FROM users WHERE username=?").get("admin");
if (!user) {
  db.prepare("INSERT INTO users (username,password,name) VALUES (?,?,?)")
    .run("admin", "1234", "Guilherme Chuva");
}

const count = db.prepare("SELECT COUNT(*) AS c FROM projects").get().c;
if (!count) {
  const insert = db.prepare(`
    INSERT INTO projects (name,client,location,status,progress,start_date,end_date)
    VALUES (?,?,?,?,?,?,?)
  `);
  insert.run("Residencial Jardim", "Construtora Horizonte", "São Paulo - SP", "Em andamento", 72, "2026-01-15", "2026-11-30");
  insert.run("Edifício Chuva Tower", "GC Empreendimentos", "Osasco - SP", "Planejamento", 18, "2026-05-10", "2027-04-20");
  insert.run("Centro Comercial Norte", "Grupo Alpha", "Barueri - SP", "Concluída", 100, "2025-02-01", "2026-03-18");
}

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/login", (req,res) => {
  const { username, password } = req.body;
  const found = db.prepare("SELECT id,name,username FROM users WHERE username=? AND password=?")
    .get(username, password);
  if (!found) return res.status(401).json({error:"Usuário ou senha inválidos."});
  res.json({ok:true, user:found});
});

app.get("/api/dashboard", (req,res) => {
  const projects = db.prepare("SELECT * FROM projects ORDER BY id DESC").all();
  const expenses = db.prepare("SELECT COALESCE(SUM(amount),0) AS total FROM expenses").get().total;
  const tasks = db.prepare("SELECT COUNT(*) AS total FROM tasks WHERE status != 'Concluída'").get().total;
  res.json({projects, expenses, pendingTasks:tasks});
});

app.get("/api/projects", (req,res) => {
  res.json(db.prepare("SELECT * FROM projects ORDER BY id DESC").all());
});

app.post("/api/projects", (req,res) => {
  const {name,client,location,status,progress,start_date,end_date} = req.body;
  if (!name || !client || !location) return res.status(400).json({error:"Preencha nome, cliente e localização."});
  const result = db.prepare(`
    INSERT INTO projects (name,client,location,status,progress,start_date,end_date)
    VALUES (?,?,?,?,?,?,?)
  `).run(name,client,location,status || "Em andamento",Number(progress)||0,start_date||null,end_date||null);
  res.json(db.prepare("SELECT * FROM projects WHERE id=?").get(result.lastInsertRowid));
});

app.put("/api/projects/:id", (req,res) => {
  const {name,client,location,status,progress,start_date,end_date} = req.body;
  db.prepare(`
    UPDATE projects SET name=?,client=?,location=?,status=?,progress=?,start_date=?,end_date=?
    WHERE id=?
  `).run(name,client,location,status,Number(progress)||0,start_date||null,end_date||null,req.params.id);
  res.json({ok:true});
});

app.delete("/api/projects/:id", (req,res) => {
  db.prepare("DELETE FROM projects WHERE id=?").run(req.params.id);
  res.json({ok:true});
});

app.get("/api/tasks", (req,res) => {
  res.json(db.prepare(`
    SELECT tasks.*, projects.name AS project_name
    FROM tasks JOIN projects ON projects.id=tasks.project_id
    ORDER BY tasks.id DESC
  `).all());
});

app.post("/api/tasks", (req,res) => {
  const {project_id,title,responsible,status,due_date} = req.body;
  const result = db.prepare(`
    INSERT INTO tasks (project_id,title,responsible,status,due_date)
    VALUES (?,?,?,?,?)
  `).run(project_id,title,responsible,status||"Pendente",due_date||null);
  res.json({id:result.lastInsertRowid});
});

app.patch("/api/tasks/:id", (req,res) => {
  db.prepare("UPDATE tasks SET status=? WHERE id=?").run(req.body.status, req.params.id);
  res.json({ok:true});
});

app.get("/api/expenses", (req,res) => {
  res.json(db.prepare(`
    SELECT expenses.*, projects.name AS project_name
    FROM expenses JOIN projects ON projects.id=expenses.project_id
    ORDER BY expense_date DESC, expenses.id DESC
  `).all());
});

app.post("/api/expenses", (req,res) => {
  const {project_id,description,category,amount,expense_date} = req.body;
  const result = db.prepare(`
    INSERT INTO expenses (project_id,description,category,amount,expense_date)
    VALUES (?,?,?,?,?)
  `).run(project_id,description,category,Number(amount),expense_date);
  res.json({id:result.lastInsertRowid});
});

app.delete("/api/expenses/:id", (req,res) => {
  db.prepare("DELETE FROM expenses WHERE id=?").run(req.params.id);
  res.json({ok:true});
});

app.get("/api/health", (req,res) => res.json({ok:true, database:"SQLite conectado"}));

app.listen(PORT, () => console.log(`GC Gestão de Obras: http://localhost:${PORT}`));
