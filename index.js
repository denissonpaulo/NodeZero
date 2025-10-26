const database = require('./db');
const Produto = require('./models/produto');
const ProdutoRoutes = require('./routes/produtoRoutes');
const HtmlController = require('./controllers/htmlController');
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

(async () => {
    try {
        // Sincronizar banco de dados
        const resultado = await database.sync();
        console.log('Banco de dados sincronizado com sucesso:', resultado);

        // Criar servidor HTTP
        const server = http.createServer(async (req, res) => {
            // Configurar CORS
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

            // Lidar com preflight requests
            if (req.method === 'OPTIONS') {
                res.writeHead(200);
                res.end();
                return;
            }

            // Servir arquivos estáticos (CSS e JS)
            if (req.url === '/style.css') {
                try {
                    const css = fs.readFileSync(path.join(__dirname, 'public/style.css'), 'utf8');
                    res.writeHead(200, { 'Content-Type': 'text/css' });
                    res.end(css);
                    return;
                } catch (error) {
                    res.writeHead(404);
                    res.end('CSS não encontrado');
                    return;
                }
            }

            if (req.url === '/script.js') {
                try {
                    const js = fs.readFileSync(path.join(__dirname, 'public/script.js'), 'utf8');
                    res.writeHead(200, { 'Content-Type': 'application/javascript' });
                    res.end(js);
                    return;
                } catch (error) {
                    res.writeHead(404);
                    res.end('JavaScript não encontrado');
                    return;
                }
            }

            // Parse URL para obter query parameters
            const parsedUrl = url.parse(req.url, true);
            const pathname = parsedUrl.pathname;
            const query = parsedUrl.query;

            // Rotas da aplicação
            if (pathname === '/') {
                // Página inicial
                HtmlController.paginaInicial(req, res);
            } else if (pathname === '/cadastro') {
                // Página de cadastro
                HtmlController.paginaCadastro(req, res);
            } else if (pathname === '/sucesso') {
                // Página de sucesso após cadastro
                HtmlController.paginaSucesso(req, res);
            } else if (pathname === '/produtos-lista') {
                // Página de lista de produtos com filtros
                const reqWithQuery = Object.create(req);
                reqWithQuery.query = query;
                HtmlController.paginaListaProdutos(reqWithQuery, res);
            } else if (pathname.startsWith('/editar/')) {
                // Página de edição de produto
                const produtoId = pathname.split('/')[2];
                HtmlController.paginaEditar(req, res, produtoId);
            } else if (pathname.startsWith('/consultar/')) {
                // Página de consulta por ID na URL
                const produtoId = pathname.split('/')[2];
                HtmlController.paginaConsultar(req, res, produtoId);
            } else if (pathname === '/consultar') {
                // Página de consulta com query parameter
                const produtoId = query.id;
                HtmlController.paginaConsultar(req, res, produtoId);
            } else if (pathname.startsWith('/produtos')) {
                // API de produtos
                ProdutoRoutes.configurarRotas(req, res);
            // Rotas da aplicação
            } else if (pathname === '/') {
                // Página inicial
                HtmlController.paginaInicial(req, res);
            } else if (pathname === '/cadastro') {
                // Página de escolha de cadastro
                HtmlController.paginaCadastro(req, res);
            } else if (pathname === '/cadastro-manual') {
                // Cadastro manual tradicional
                HtmlController.paginaCadastroManual(req, res);
            } else if (pathname === '/cadastro-qrcode') {
                // Cadastro via QR Code
                HtmlController.paginaCadastroQrcode(req, res);
            } else if (pathname === '/sucesso') {
                // Página de sucesso após cadastro
                HtmlController.paginaSucesso(req, res);
            } else {
                // Rota não encontrada
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Página Não Encontrada</title>
                        <style>
                            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                            h1 { color: #dc3545; }
                            a { color: #007bff; text-decoration: none; }
                        </style>
                    </head>
                    <body>
                        <h1>404 - Página Não Encontrada</h1>
                        <p>A página que você está procurando não existe.</p>
                        <p><a href="/">Voltar para a página inicial</a></p>
                    </body>
                    </html>
                `);
            }
        });

        // Iniciar servidor
        server.listen(3000, () => {
            console.log('🚀 Servidor rodando na porta 3000');
            console.log('📧 Acesse: http://localhost:3000');
            console.log('📝 Cadastro: http://localhost:3000/cadastro');
            console.log('📦 Lista de Produtos: http://localhost:3000/produtos-lista');
            console.log('🔍 Consulta: http://localhost:3000/consultar');
            console.log('🛒 API: http://localhost:3000/produtos');
        });

    } catch (error) {
        console.error('Erro ao iniciar servidor:', error);
    }
})();