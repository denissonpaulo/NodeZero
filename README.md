# NodeJS
Aulas sobre Node JS, projeto para treinamento.

🚀 Sistema de Gerenciamento de Produtos

Um sistema completo de CRUD (Create, Read, Update, Delete) para gerenciamento de produtos desenvolvido em Node.js com interface web moderna.
✨ Funcionalidades

    📦 Cadastro de Produtos - Manual ou via QR Code (simulado)

    🔍 Consulta Avançada - Filtros por nome, descrição e preço

    ✏️ Edição em Tempo Real - Interface intuitiva para atualização

    🗑️ Exclusão Segura - Com confirmação antes da deleção

    🤖 Chatbot Integrado - Assistente virtual para ajuda

    📱 Design Responsivo - Funciona em desktop e mobile

    🔗 API RESTful - Endpoints JSON para integração

🛠️ Tecnologias Utilizadas

    Backend: Node.js, Express.js

    Banco de Dados: SQLite com Sequelize ORM

    Frontend: HTML5, CSS3, JavaScript Vanilla

    Arquitetura: MVC (Model-View-Controller)

📋 Pré-requisitos
Para Linux (Ubuntu/Debian/Mint):
bash

# Instalar Node.js
sudo apt update
sudo apt install nodejs npm

# Verificar instalação
node --version  # Deve ser 14+
npm --version   # Deve ser 6+

Para Windows:

    Baixe o Node.js do site oficial: nodejs.org

    Execute o instalador e siga as instruções

    Abra o PowerShell ou Prompt de Comando como Administrador

    Verifique a instalação:

cmd

node --version
npm --version

🚀 Instalação e Configuração
1. Clone ou Baixe o Projeto
bash

# Se estiver usando Git
git clone <url-do-repositorio>
cd nome-do-projeto

# Ou extraia os arquivos ZIP na pasta desejada

2. Instale as Dependências
bash

npm install

3. Estrutura de Pastas
text

projeto/
├── controllers/          # Lógica da aplicação
├── models/              # Modelos do banco de dados
├── routes/              # Configuração de rotas
├── public/              # Arquivos estáticos (CSS, JS)
├── banco/               # Banco de dados SQLite (criado automaticamente)
├── index.js             # Arquivo principal
└── package.json         # Dependências do projeto

4. Execute o Projeto
bash

# Desenvolvimento (com logs detalhados)
node index.js

# Ou com depuração de warnings
node --trace-deprecation index.js

5. Acesse o Sistema

Abra seu navegador e acesse: http://localhost:3000
📊 Endpoints da API
Produtos

    GET /produtos - Lista todos os produtos

    GET /produtos/:id - Busca produto por ID

    POST /produtos - Cria novo produto

    PUT /produtos/:id - Atualiza produto

    DELETE /produtos/:id - Remove produto

Páginas Web

    GET / - Página inicial

    GET /cadastro - Opções de cadastro

    GET /cadastro-manual - Formulário manual

    GET /cadastro-qrcode - Cadastro via QR Code

    GET /produtos-lista - Lista com filtros

    GET /consultar - Consulta por ID

    GET /editar/:id - Edição de produto

🐧 Comandos Úteis para Linux
Gerenciamento do Servidor
bash

# Parar servidor
pkill -f "node index.js"

# Verificar processos Node.js
ps aux | grep node

# Verificar porta 3000
sudo netstat -tulpn | grep :3000
# ou
ss -tulpn | grep :3000

Solução de Problemas
bash

# Permissões do banco de dados
chmod 644 banco/database.sqlite

# Reinstalar dependências
rm -rf node_modules
npm install

🪟 Comandos Úteis para Windows
Gerenciamento do Servidor
cmd

:: Parar servidor (Ctrl+C no terminal)
taskkill /f /im node.exe

:: Verificar processos Node.js
tasklist | findstr node

:: Verificar porta 3000
netstat -ano | findstr :3000

PowerShell
powershell

# Parar servidor
Get-Process node | Stop-Process

# Verificar porta
Get-NetTCPConnection -LocalPort 3000

🔧 Solução de Problemas Comuns
Erro de Porta em Uso
bash

# Linux
sudo kill -9 $(sudo lsof -t -i:3000)

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

Erro de Permissões (Linux)
bash

sudo chmod -R 755 .
sudo chown -R $USER:$USER .

Dependências Corrompidas
bash

rm -rf node_modules
npm cache clean --force
npm install

Banco de Dados com Problemas
bash

# Remove o banco para recriar (PERDE TODOS OS DADOS)
rm banco/database.sqlite
node index.js

🎯 Como Usar o Sistema
1. Cadastro de Produtos

    Acesse Cadastrar Novo Produto

    Escolha entre Manual ou QR Code

    Preencha nome, preço e descrição

    Confirme o cadastro

2. Gerenciamento

    Na Lista de Produtos use filtros avançados

    Clique em Editar para modificar

    Use Excluir para remover produtos

3. Consulta

    Use a Consulta por ID para buscar específicos

    Ou acesse a API em /produtos para dados JSON

4. Assistente

    Clique no botão "Precisa de Ajuda?"

    O chatbot responde perguntas sobre o sistema

📝 Desenvolvimento
Adicionando Novas Funcionalidades

    Crie o modelo em models/

    Adicione controllers em controllers/

    Configure rotas em routes/

    Atualize as views no HtmlController

Estrutura de um Produto
javascript

{
  id: 1,
  nome: "Produto Exemplo",
  preco: 99.90,
  descricao: "Descrição do produto",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
}

🤝 Contribuindo

    Faça o fork do projeto

    Crie uma branch para sua feature (git checkout -b feature/AmazingFeature)

    Commit suas mudanças (git commit -m 'Add some AmazingFeature')

    Push para a branch (git push origin feature/AmazingFeature)

    Abra um Pull Request

📄 Licença

Este projeto está sob a licença GNU GENERAL PUBLIC LICENSE. Veja o arquivo LICENSE para mais detalhes.
🆘 Suporte

Se encontrar problemas:

    Verifique os logs no terminal

    Confirme que todas as dependências estão instaladas

    Teste a API em http://localhost:3000/produtos

    Verifique as permissões do banco de dados


