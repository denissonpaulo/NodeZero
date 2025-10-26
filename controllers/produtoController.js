const Produto = require('../models/produto');

class ProdutoController {
    // CREATE - Criar produto a partir do formulário
    static async criarProduto(req, res) {
        try {
            let body = '';
            
            req.on('data', chunk => {
                body += chunk.toString();
            });

            req.on('end', async () => {
                try {
                    // Parse do form data
                    const params = new URLSearchParams(body);
                    const nome = params.get('nome');
                    const preco = parseFloat(params.get('preco'));
                    const descricao = params.get('descricao');

                    // Validações
                    if (!nome || !preco) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        return res.end(JSON.stringify({ 
                            success: false, 
                            error: 'Nome e preço são obrigatórios' 
                        }));
                    }

                    const resultadoCreate = await Produto.create({
                        nome,
                        preco,
                        descricao
                    });

                    console.log('Produto criado com sucesso:', resultadoCreate);

                    // Redireciona para página de sucesso
                    res.writeHead(302, {
                        'Location': '/sucesso'
                    });
                    res.end();

                } catch (parseError) {
                    console.error('Erro ao processar dados do formulário:', parseError);
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        success: false, 
                        error: 'Dados do formulário inválidos' 
                    }));
                }
            });

        } catch (error) {
            console.error('Erro ao criar produto:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: false, 
                error: 'Erro interno ao criar produto' 
            }));
        }
    }

    // READ - Listar todos os produtos
    static async listarProdutos(req, res) {
        try {
            const produtos = await Produto.findAll();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: true, 
                data: produtos 
            }));
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: false, 
                error: 'Erro ao buscar produtos' 
            }));
        }
    }

    // READ - Buscar produto por ID
    static async buscarProdutoPorId(req, res, id) {
        try {
            const produto = await Produto.findByPk(id);
            if (produto) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: true, 
                    data: produto 
                }));
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: false, 
                    error: 'Produto não encontrado' 
                }));
            }
        } catch (error) {
            console.error('Erro ao buscar produto:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: false, 
                error: 'Erro ao buscar produto' 
            }));
        }
    }

    // UPDATE - Atualizar produto
    static async atualizarProduto(req, res, id) {
        try {
            const produto = await Produto.findByPk(id);
            if (!produto) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ 
                    success: false, 
                    error: 'Produto não encontrado' 
                }));
            }

            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });

            req.on('end', async () => {
                try {
                    const { nome, preco, descricao } = JSON.parse(body);
                    
                    if (nome) produto.nome = nome;
                    if (preco) produto.preco = preco;
                    if (descricao) produto.descricao = descricao;

                    const resultadoSave = await produto.save();
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        success: true, 
                        message: 'Produto atualizado com sucesso', 
                        data: resultadoSave 
                    }));
                } catch (parseError) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        success: false, 
                        error: 'Dados inválidos' 
                    }));
                }
            });
        } catch (error) {
            console.error('Erro ao atualizar produto:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: false, 
                error: 'Erro ao atualizar produto' 
            }));
        }
    }

    // DELETE - Deletar produto
    static async deletarProduto(req, res, id) {
        try {
            const produto = await Produto.findByPk(id);
            if (!produto) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ 
                    success: false, 
                    error: 'Produto não encontrado' 
                }));
            }

            await produto.destroy();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: true, 
                message: 'Produto deletado com sucesso' 
            }));
        } catch (error) {
            console.error('Erro ao deletar produto:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: false, 
                error: 'Erro ao deletar produto' 
            }));
        }
    }
}

module.exports = ProdutoController;