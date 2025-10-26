const ProdutoController = require('../controllers/produtoController');
const url = require('url');

class ProdutoRoutes {
    static configurarRotas(req, res) {
        const parsedUrl = url.parse(req.url, true);
        const pathname = parsedUrl.pathname;
        const method = req.method;

        // Verificar se é PUT via formulário HTML
        let actualMethod = method;
        if (method === 'POST') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                const params = new URLSearchParams(body);
                if (params.get('_method') === 'PUT') {
                    actualMethod = 'PUT';
                }
                this.processarRota(req, res, pathname, actualMethod, body);
            });
        } else {
            this.processarRota(req, res, pathname, actualMethod);
        }
    }

    static processarRota(req, res, pathname, method, body = '') {
        // GET /produtos - Listar todos os produtos
        if (pathname === '/produtos' && method === 'GET') {
            ProdutoController.listarProdutos(req, res);
        }
        // POST /produtos - Criar novo produto (do formulário)
        else if (pathname === '/produtos' && method === 'POST') {
            // Se já temos o body do evento 'end', precisamos reemitir os dados
            if (body) {
                const newReq = Object.create(req);
                newReq.body = body;
                ProdutoController.criarProduto(newReq, res);
            } else {
                ProdutoController.criarProduto(req, res);
            }
        }
        // PUT /produtos/:id - Atualizar produto (do formulário)
        else if (pathname.match(/\/produtos\/([0-9]+)/) && method === 'PUT') {
            const id = pathname.split('/')[2];
            const newReq = Object.create(req);
            newReq.body = body;
            ProdutoController.atualizarProduto(newReq, res, id);
        }
        // GET /produtos/:id - Buscar produto por ID
        else if (pathname.match(/\/produtos\/([0-9]+)/) && method === 'GET') {
            const id = pathname.split('/')[2];
            ProdutoController.buscarProdutoPorId(req, res, id);
        }
        // DELETE /produtos/:id - Deletar produto
        else if (pathname.match(/\/produtos\/([0-9]+)/) && method === 'DELETE') {
            const id = pathname.split('/')[2];
            ProdutoController.deletarProduto(req, res, id);
        }
        // Rota não encontrada
        else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: false, 
                error: 'Rota não encontrada' 
            }));
        }
    }
}

module.exports = ProdutoRoutes;