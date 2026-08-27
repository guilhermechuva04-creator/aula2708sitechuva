# GC Gestão de Obras

Sistema acadêmico funcional para demonstração de gestão de obras.

## Recursos
- Login funcional
- Dashboard com indicadores
- Cadastro e exclusão de obras
- Barra de progresso
- Gestão de tarefas e status
- Controle de despesas
- Banco SQLite persistente
- API REST local

## Como executar

1. Instale Node.js 18+.
2. Abra o terminal nesta pasta.
3. Execute:
   `npm install`
4. Depois:
   `npm start`
5. Acesse:
   `http://localhost:3000`

## Acesso de demonstração
Usuário: `admin`
Senha: `1234`

## Banco de dados
O arquivo `database.sqlite` é criado automaticamente na primeira execução. A conexão é feita pelo backend através do pacote `better-sqlite3`.

## Estrutura
- `server.js` — servidor Express + API + conexão SQLite
- `public/index.html` — login
- `public/dashboard.html` — painel principal
- `public/obras.html` — gerenciamento de obras
- `public/tarefas.html` — tarefas
- `public/financeiro.html` — financeiro
- `public/*.js` — lógica do frontend
- `public/style.css` — interface
