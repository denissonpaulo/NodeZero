const ProdutoController = require('../controllers/produtoController');
const url = require('url');

class ProdutoRoutes {
    static async configurarRotas(req, res) {
        const parsedUrl = url.parse(req.url, true);
        const pathname = parsedUrl.pathname;
        const method = req.method;

        console.log(`🛣️  Rota API: ${method} ${pathname}`);

        // Verificar se é PUT via formulário HTML
        let actualMethod = method;
        if (method === 'POST') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', async () => {
                try {
                    const params = new URLSearchParams(body);
                    if (params.get('_method') === 'PUT') {
                        actualMethod = 'PUT';
                    }
                    await this.processarRota(req, res, pathname, actualMethod, body);
                } catch (error) {
                    console.error('❌ Erro no processamento da rota:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        success: false, 
                        error: 'Erro interno do servidor' 
                    }));
                }
            });
        } else {
            await this.processarRota(req, res, pathname, actualMethod);
        }
    }

    static async processarRota(req, res, pathname, method, body = '') {
        try {
            // GET /produtos - Listar todos os produtos
            if (pathname === '/produtos' && method === 'GET') {
                await ProdutoController.listarProdutos(req, res);
            }
            // POST /produtos - Criar novo produto (do formulário)
            else if (pathname === '/produtos' && method === 'POST') {
                console.log('🎯 Rota POST /produtos detectada');
                // Se já temos o body do evento 'end', precisamos reemitir os dados
                if (body) {
                    const newReq = Object.create(req);
                    newReq.body = body;
                    await ProdutoController.criarProduto(newReq, res);
                } else {
                    await ProdutoController.criarProduto(req, res);
                }
            }
            // PUT /produtos/:id - Atualizar produto (do formulário)
            else if (pathname.match(/\/produtos\/([0-9]+)/) && method === 'PUT') {
                const id = pathname.split('/')[2];
                const newReq = Object.create(req);
                newReq.body = body;
                await ProdutoController.atualizarProduto(newReq, res, id);
            }
            // GET /produtos/:id - Buscar produto por ID
            else if (pathname.match(/\/produtos\/([0-9]+)/) && method === 'GET') {
                const id = pathname.split('/')[2];
                await ProdutoController.buscarProdutoPorId(req, res, id);
            }
            // DELETE /produtos/:id - Deletar produto
            else if (pathname.match(/\/produtos\/([0-9]+)/) && method === 'DELETE') {
                const id = pathname.split('/')[2];
                await ProdutoController.deletarProduto(req, res, id);
            }
            // Rota não encontrada
            else {
                console.log(`❌ Rota não encontrada: ${method} ${pathname}`);
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: false, 
                    error: 'Rota não encontrada' 
                }));
            }
        } catch (error) {
            console.error('❌ Erro no processamento da rota:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: false, 
                error: 'Erro interno do servidor',
                message: error.message
            }));
        }
    }
}

module.exports = ProdutoRoutes;