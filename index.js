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
        await database.authenticate();
        console.log('✅ Conexão com SQLite estabelecida com sucesso');
        await database.sync({ force: false });
        console.log('✅ Modelos sincronizados com sucesso');

        // Criar servidor HTTP
        const server = http.createServer(async (req, res) => {
            // Configurar CORS e headers
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            res.setHeader('X-Powered-By', 'Linux Mint');

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
                    console.error('❌ Erro ao carregar CSS:', error);
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
                    console.error('❌ Erro ao carregar JavaScript:', error);
                    res.writeHead(404);
                    res.end('JavaScript não encontrado');
                    return;
                }
            }

            // Parse URL
            const parsedUrl = url.parse(req.url, true);
            const pathname = parsedUrl.pathname;
            const query = parsedUrl.query;

            console.log(`🐧 [${new Date().toISOString()}] ${req.method} ${pathname}`);

            // Rotas da aplicação
            try {
                if (pathname === '/') {
                    await HtmlController.paginaInicial(req, res);
                } else if (pathname === '/cadastro') {
                    await HtmlController.paginaCadastro(req, res);
                } else if (pathname === '/cadastro-manual') {
                    await HtmlController.paginaCadastroManual(req, res);
                } else if (pathname === '/cadastro-qrcode') {
                    await HtmlController.paginaCadastroQrcode(req, res);
                } else if (pathname === '/sucesso') {
                    await HtmlController.paginaSucesso(req, res);
                } else if (pathname === '/produtos-lista') {
                    await HtmlController.paginaListaProdutos(req, res);
                } else if (pathname.startsWith('/editar/')) {
                    const produtoId = pathname.split('/')[2];
                    await HtmlController.paginaEditar(req, res, produtoId);
                } else if (pathname.startsWith('/consultar/')) {
                    const produtoId = pathname.split('/')[2];
                    await HtmlController.paginaConsultar(req, res, produtoId);
                } else if (pathname === '/consultar') {
                    const produtoId = query.id;
                    await HtmlController.paginaConsultar(req, res, produtoId);
                } else if (pathname.startsWith('/produtos')) {
                    await ProdutoRoutes.configurarRotas(req, res);
                } else {
                    // Rota não encontrada
                    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.end(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <title>Página Não Encontrada</title>
                            <style>
                                body { 
                                    font-family: 'Ubuntu', Arial, sans-serif; 
                                    text-align: center; 
                                    padding: 50px;
                                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                    color: white;
                                    min-height: 100vh;
                                }
                                .container {
                                    background: white;
                                    color: #333;
                                    padding: 40px;
                                    border-radius: 15px;
                                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                                    max-width: 500px;
                                    margin: 0 auto;
                                }
                                h1 { color: #dc3545; margin-bottom: 20px; }
                                a { 
                                    color: #007bff; 
                                    text-decoration: none;
                                    font-weight: bold;
                                }
                                a:hover { text-decoration: underline; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <h1>🐧 404 - Página Não Encontrada</h1>
                                <p>A página que você está procurando não existe no sistema.</p>
                                <p><a href="/">🏠 Voltar para a página inicial</a></p>
                            </div>
                        </body>
                        </html>
                    `);
                }
            } catch (error) {
                console.error('❌ Erro na rota:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: false, 
                    error: 'Erro interno do servidor',
                    message: error.message
                }));
            }
        });

        // Configurar tratamento de sinais para Linux
        process.on('SIGINT', () => {
            console.log('\n🐧 Recebido SIGINT - Encerrando servidor graciosamente...');
            server.close(() => {
                console.log('✅ Servidor encerrado');
                process.exit(0);
            });
        });

        process.on('SIGTERM', () => {
            console.log('\n🐧 Recebido SIGTERM - Encerrando servidor...');
            server.close(() => {
                console.log('✅ Servidor encerrado');
                process.exit(0);
            });
        });

        // Iniciar servidor
        const PORT = process.env.PORT || 3000;
        server.listen(PORT, '0.0.0.0', () => {
            console.log('\n🐧 === SISTEMA INICIADO NO LINUX MINT ===');
            console.log('🚀 Servidor Node.js rodando na porta', PORT);
            console.log('📧 Acesse: http://localhost:' + PORT);
            console.log('📝 Cadastro: http://localhost:' + PORT + '/cadastro');
            console.log('📦 Lista: http://localhost:' + PORT + '/produtos-lista');
            console.log('🔍 API JSON: http://localhost:' + PORT + '/produtos');
            console.log('💻 PID:', process.pid);
            console.log('====================================\n');
        });

        // Tratamento de erros não capturados
        process.on('uncaughtException', (error) => {
            console.error('❌ Erro não capturado:', error);
        });

        process.on('unhandledRejection', (reason, promise) => {
            console.error('❌ Promise rejeitada não tratada:', reason);
        });

    } catch (error) {
        console.error('❌ Erro crítico ao iniciar servidor:', error);
        process.exit(1);
    }
})();