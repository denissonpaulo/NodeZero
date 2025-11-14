const Produto = require('../models/produto');

class ProdutoController {
    // CREATE - Criar produto a partir do formulário
    static async criarProduto(req, res) {
        console.log('📝 Iniciando criação de produto...');
        
        return new Promise((resolve, reject) => {
            let body = '';
            
            // Se o body já veio pré-processado das rotas
            if (req.body) {
                console.log('✅ Body pré-processado recebido');
                body = req.body;
                this.processarCriacao(req, res, body, resolve, reject);
                return;
            }
            
            req.on('data', chunk => {
                body += chunk.toString();
                console.log('📦 Recebendo dados...', body.length, 'bytes');
            });

            req.on('end', () => {
                this.processarCriacao(req, res, body, resolve, reject);
            });

            req.on('error', (error) => {
                console.error('❌ Erro na requisição:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: false, 
                    error: 'Erro na requisição' 
                }));
                reject(error);
            });

            // Timeout para evitar requisições travadas
            req.setTimeout(10000, () => {
                console.error('❌ Timeout na requisição');
                res.writeHead(408, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: false, 
                    error: 'Timeout na requisição' 
                }));
                resolve();
            });
        });
    }

    static async processarCriacao(req, res, body, resolve, reject) {
        try {
            console.log('✅ Dados completos recebidos:', body);
            
            // Parse do form data
            const params = new URLSearchParams(body);
            const nome = params.get('nome');
            const preco = parseFloat(params.get('preco'));
            const descricao = params.get('descricao');

            console.log('📋 Dados parseados:', { nome, preco, descricao });

            // Validações
            if (!nome || nome.trim() === '') {
                console.log('❌ Nome vazio');
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: false, 
                    error: 'Nome do produto é obrigatório' 
                }));
                return resolve();
            }

            if (!preco || isNaN(preco) || preco <= 0) {
                console.log('❌ Preço inválido:', preco);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: false, 
                    error: 'Preço deve ser um número positivo' 
                }));
                return resolve();
            }

            console.log('💾 Salvando no banco de dados...');
            
            const resultadoCreate = await Produto.create({
                nome: nome.trim(),
                preco,
                descricao: descricao ? descricao.trim() : null
            });

            console.log('✅ Produto criado com sucesso - ID:', resultadoCreate.id);

            // Redireciona para página de sucesso
            res.writeHead(302, {
                'Location': '/sucesso'
            });
            res.end();
            resolve();

        } catch (parseError) {
            console.error('❌ Erro ao processar dados do formulário:', parseError);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: false, 
                error: 'Dados do formulário inválidos' 
            }));
            resolve();
        }
    }

    // READ - Listar todos os produtos
    static async listarProdutos(req, res) {
        try {
            console.log('📦 Buscando todos os produtos...');
            const produtos = await Produto.findAll({
                order: [['id', 'ASC']]
            });
            
            console.log(`✅ Encontrados ${produtos.length} produtos`);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: true, 
                data: produtos,
                count: produtos.length
            }));
        } catch (error) {
            console.error('❌ Erro ao buscar produtos:', error);
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
            console.log(`🔍 Buscando produto ID: ${id}`);
            
            if (!id || isNaN(id)) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ 
                    success: false, 
                    error: 'ID do produto inválido' 
                }));
            }

            const produto = await Produto.findByPk(id);
            if (produto) {
                console.log(`✅ Produto encontrado: ${produto.nome}`);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: true, 
                    data: produto 
                }));
            } else {
                console.log(`❌ Produto não encontrado: ${id}`);
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: false, 
                    error: 'Produto não encontrado' 
                }));
            }
        } catch (error) {
            console.error('❌ Erro ao buscar produto:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: false, 
                error: 'Erro ao buscar produto' 
            }));
        }
    }

    // UPDATE - Atualizar produto
    static async atualizarProduto(req, res, id) {
        console.log(`✏️ Iniciando atualização do produto ID: ${id}`);
        
        return new Promise((resolve, reject) => {
            let body = '';
            
            // Se o body já veio pré-processado das rotas
            if (req.body) {
                console.log('✅ Body pré-processado recebido');
                body = req.body;
                this.processarAtualizacao(req, res, id, body, resolve, reject);
                return;
            }
            
            req.on('data', chunk => {
                body += chunk.toString();
            });

            req.on('end', () => {
                this.processarAtualizacao(req, res, id, body, resolve, reject);
            });

            req.on('error', (error) => {
                console.error('❌ Erro na requisição:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: false, 
                    error: 'Erro na requisição' 
                }));
                reject(error);
            });
        });
    }

    static async processarAtualizacao(req, res, id, body, resolve, reject) {
        try {
            if (!id || isNaN(id)) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: false, 
                    error: 'ID do produto inválido' 
                }));
                return resolve();
            }

            const produto = await Produto.findByPk(id);
            if (!produto) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: false, 
                    error: 'Produto não encontrado' 
                }));
                return resolve();
            }

            const dados = JSON.parse(body);
            const { nome, preco, descricao } = dados;
            
            console.log('📋 Dados para atualização:', dados);

            // Validações
            if (nome && nome.trim() === '') {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: false, 
                    error: 'Nome do produto não pode estar vazio' 
                }));
                return resolve();
            }

            if (preco && (isNaN(preco) || preco <= 0)) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: false, 
                    error: 'Preço deve ser um número positivo' 
                }));
                return resolve();
            }

            // Atualizar apenas os campos fornecidos
            if (nome !== undefined) produto.nome = nome.trim();
            if (preco !== undefined) produto.preco = preco;
            if (descricao !== undefined) produto.descricao = descricao ? descricao.trim() : null;

            console.log('💾 Salvando atualização...');
            const resultadoSave = await produto.save();
            
            console.log(`✅ Produto atualizado: ${produto.nome}`);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: true, 
                message: 'Produto atualizado com sucesso', 
                data: resultadoSave 
            }));
            resolve();
        } catch (parseError) {
            console.error('❌ Erro ao parsear JSON:', parseError);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: false, 
                error: 'JSON inválido' 
            }));
            resolve();
        }
    }

    // DELETE - Deletar produto
    static async deletarProduto(req, res, id) {
        try {
            console.log(`🗑️ Iniciando exclusão do produto ID: ${id}`);
            
            if (!id || isNaN(id)) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ 
                    success: false, 
                    error: 'ID do produto inválido' 
                }));
            }

            const produto = await Produto.findByPk(id);
            if (!produto) {
                console.log(`❌ Produto não encontrado para exclusão: ${id}`);
                res.writeHead(404, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ 
                    success: false, 
                    error: 'Produto não encontrado' 
                }));
            }

            await produto.destroy();
            console.log(`✅ Produto excluído: ${id}`);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: true, 
                message: 'Produto deletado com sucesso',
                deletedId: id
            }));
        } catch (error) {
            console.error('❌ Erro ao deletar produto:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: false, 
                error: 'Erro ao deletar produto' 
            }));
        }
    }
}

module.exports = ProdutoController;