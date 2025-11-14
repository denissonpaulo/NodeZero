const fs = require('fs');
const path = require('path');
const Produto = require('../models/produto');
const { Op } = require('sequelize');

class HtmlController {
    static async paginaInicial(req, res) {
        try {
            const css = fs.readFileSync(path.join(__dirname, '../public/style.css'), 'utf8');

            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Sistema de Produtos</title>
                    <style>${css}</style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🚀 Sistema de Produtos</h1>
                            <p>Gerencie seus produtos de forma simples e eficiente</p>
                        </div>
                        
                        <div class="card">
                            <h2>📋 Ações Disponíveis</h2>
                            <div class="form-actions">
                                <a href="/cadastro" class="btn btn-success">➕ Cadastrar Novo Produto</a>
                                <a href="/produtos-lista" class="btn">📦 Ver Todos Produtos</a>
                                <a href="/produtos" class="btn" target="_blank">🔗 API JSON</a>
                            </div>
                        </div>

                        <div class="card">
                            <h2>🔍 Consultar Produto por ID</h2>
                            <form action="/consultar" method="GET" style="display: flex; gap: 10px; align-items: end;">
                                <div class="form-group" style="flex: 1; margin-bottom: 0;">
                                    <label for="idConsulta">ID do Produto</label>
                                    <input type="number" id="idConsulta" name="id" required 
                                           placeholder="Digite o ID do produto" min="1">
                                </div>
                                <button type="submit" class="btn">🔍 Consultar</button>
                            </form>
                        </div>

                        <div class="card">
                            <h2>ℹ️ Informações do Sistema</h2>
                            <p>Este sistema permite gerenciar produtos com operações completas de CRUD:</p>
                            <ul style="text-align: left; margin: 15px 0; padding-left: 20px;">
                                <li><strong>Cadastrar</strong> novos produtos</li>
                                <li><strong>Listar</strong> todos os produtos com filtros</li>
                                <li><strong>Consultar</strong> produtos por ID</li>
                                <li><strong>Editar</strong> informações dos produtos</li>
                                <li><strong>Excluir</strong> produtos do sistema</li>
                            </ul>
                        </div>
                    </div>
                    <script src="/script.js"></script>
                </body>
                </html>
            `);
        } catch (error) {
            console.error('Erro ao carregar página inicial:', error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Erro interno do servidor');
        }
    }

    static async paginaListaProdutos(req, res) {
        try {
            const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
            const searchParams = parsedUrl.searchParams;

            const search = searchParams.get('search');
            const campo = searchParams.get('campo');
            const minPreco = searchParams.get('minPreco');
            const maxPreco = searchParams.get('maxPreco');
            const page = parseInt(searchParams.get('page')) || 1;
            const limit = parseInt(searchParams.get('limit')) || 10;

            const pagina = page;
            const limite = limit;
            const offset = (pagina - 1) * limite;

            let where = {};

            // Aplicar filtros
            if (search && campo) {
                if (campo === 'nome' || campo === 'descricao') {
                    where[campo] = {
                        [Op.like]: `%${search}%`
                    };
                } else if (campo === 'preco') {
                    where.preco = {};
                    if (minPreco) where.preco[Op.gte] = parseFloat(minPreco);
                    if (maxPreco) where.preco[Op.lte] = parseFloat(maxPreco);
                }
            }

            // Buscar produtos com paginação
            const { count: totalProdutos, rows: produtos } = await Produto.findAndCountAll({
                where,
                order: [['id', 'ASC']],
                limit: limite,
                offset: offset
            });

            const totalPaginas = Math.ceil(totalProdutos / limite);
            const css = fs.readFileSync(path.join(__dirname, '../public/style.css'), 'utf8');

            // Função auxiliar para gerar URLs de paginação
            const gerarUrlPaginacao = (page, limit) => {
                const params = new URLSearchParams();
                params.set('page', page);
                params.set('limit', limit || limite);

                if (search) params.set('search', search);
                if (campo) params.set('campo', campo);
                if (minPreco) params.set('minPreco', minPreco);
                if (maxPreco) params.set('maxPreco', maxPreco);

                return '/produtos-lista?' + params.toString();
            };

            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Lista de Produtos - Sistema de Produtos</title>
                    <style>${css}</style>
                </head>
                <body>
                    <div class="container">
                        <a href="/" class="back-link">← Voltar para a página inicial</a>
                        
                        <div class="card">
                            <div class="header">
                                <h1>📦 Todos os Produtos Cadastrados</h1>
                                <p>Gerencie seus produtos cadastrados no sistema</p>
                            </div>

                            <!-- Filtros -->
                            <div class="filtros-container">
                                <h3>🔍 Filtros</h3>
                                <form method="GET" action="/produtos-lista" class="filtros-form" id="filtrosForm">
                                    <div class="filtros-grid">
                                        <div class="form-group">
                                            <label for="campo">Campo para Buscar</label>
                                            <select id="campo" name="campo" onchange="toggleFiltrosPreco()">
                                                <option value="">Selecione um campo</option>
                                                <option value="nome" ${campo === 'nome' ? 'selected' : ''}>Nome</option>
                                                <option value="descricao" ${campo === 'descricao' ? 'selected' : ''}>Descrição</option>
                                                <option value="preco" ${campo === 'preco' ? 'selected' : ''}>Preço</option>
                                            </select>
                                        </div>

                                        <div class="form-group" id="filtro-texto">
                                            <label for="search">Termo de Busca</label>
                                            <input type="text" id="search" name="search" value="${search || ''}" 
                                                   placeholder="Digite o termo para buscar">
                                        </div>

                                        <div class="form-group" id="filtro-preco" style="display: none;">
                                            <div class="preco-filters">
                                                <div>
                                                    <label for="minPreco">Preço Mínimo</label>
                                                    <input type="number" id="minPreco" name="minPreco" 
                                                           value="${minPreco || ''}" step="0.01" placeholder="0.00">
                                                </div>
                                                <div>
                                                    <label for="maxPreco">Preço Máximo</label>
                                                    <input type="number" id="maxPreco" name="maxPreco" 
                                                           value="${maxPreco || ''}" step="0.01" placeholder="9999.99">
                                                </div>
                                            </div>
                                        </div>

                                        <div class="form-group">
                                            <label for="limit">Itens por Página</label>
                                            <select id="limit" name="limit" onchange="mudarItensPorPagina(this.value)">
                                                <option value="10" ${limite === 10 ? 'selected' : ''}>10 itens</option>
                                                <option value="20" ${limite === 20 ? 'selected' : ''}>20 itens</option>
                                                <option value="30" ${limite === 30 ? 'selected' : ''}>30 itens</option>
                                                <option value="50" ${limite === 50 ? 'selected' : ''}>50 itens</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div class="form-actions">
                                        <button type="submit" class="btn">🔍 Aplicar Filtros</button>
                                        <a href="/produtos-lista" class="btn btn-danger">🗑️ Limpar Filtros</a>
                                        <span class="resultados-info">
                                            ${totalProdutos} produto(s) encontrado(s) - Página ${pagina} de ${totalPaginas}
                                        </span>
                                    </div>
                                </form>
                            </div>

                            <!-- Lista de Produtos -->
                            <div class="produtos-container">
                                ${produtos.length > 0 ? `
                                    <div class="produtos-grid">
                                        ${produtos.map(produto => `
                                            <div class="produto-card">
                                                <div class="produto-header">
                                                    <h3>${produto.nome}</h3>
                                                    <span class="produto-id">#${produto.id}</span>
                                                </div>
                                                <div class="produto-body">
                                                    <p class="produto-preco">R$ ${parseFloat(produto.preco).toFixed(2)}</p>
                                                    <p class="produto-descricao">${produto.descricao || 'Sem descrição'}</p>
                                                    <div class="produto-meta">
                                                        <small>Criado em: ${new Date(produto.createdAt).toLocaleDateString('pt-BR')}</small>
                                                        <small>Atualizado em: ${new Date(produto.updatedAt).toLocaleDateString('pt-BR')}</small>
                                                    </div>
                                                </div>
                                                <div class="produto-actions">
                                                    <a href="/editar/${produto.id}" class="btn btn-small">✏️ Editar</a>
                                                    <a href="/consultar/${produto.id}" class="btn btn-small">🔍 Detalhes</a>
                                                    <button onclick="deletarProduto(${produto.id})" class="btn btn-small btn-danger">🗑️ Excluir</button>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>

                                    <!-- Paginação -->
                                    ${totalPaginas > 1 ? `
                                        <div class="paginacao-container">
                                            <div class="paginacao-info">
                                                Mostrando ${offset + 1} a ${Math.min(offset + limite, totalProdutos)} de ${totalProdutos} produtos
                                            </div>
                                            <div class="paginacao">
                                                ${pagina > 1 ? `
                                                    <a href="${gerarUrlPaginacao(1, limite)}" class="btn-paginacao" title="Primeira página">
                                                        ⏮️
                                                    </a>
                                                    <a href="${gerarUrlPaginacao(pagina - 1, limite)}" class="btn-paginacao" title="Página anterior">
                                                        ◀️
                                                    </a>
                                                ` : ''}
                                                
                                                ${Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                const paginaNum = Math.max(1, Math.min(totalPaginas - 4, pagina - 2)) + i;
                if (paginaNum > totalPaginas) return '';
                return `
                                                        <a href="${gerarUrlPaginacao(paginaNum, limite)}" 
                                                           class="btn-paginacao ${paginaNum === pagina ? 'active' : ''}">
                                                            ${paginaNum}
                                                        </a>
                                                    `;
            }).join('')}
                                                
                                                ${pagina < totalPaginas ? `
                                                    <a href="${gerarUrlPaginacao(pagina + 1, limite)}" class="btn-paginacao" title="Próxima página">
                                                        ▶️
                                                    </a>
                                                    <a href="${gerarUrlPaginacao(totalPaginas, limite)}" class="btn-paginacao" title="Última página">
                                                        ⏭️
                                                    </a>
                                                ` : ''}
                                            </div>
                                        </div>
                                    ` : ''}
                                ` : `
                                    <div class="no-products">
                                        <h3>📭 Nenhum produto encontrado</h3>
                                        <p>${search ? 'Tente ajustar os filtros de busca.' : 'Comece cadastrando seu primeiro produto.'}</p>
                                        ${!search && `
                                            <div class="form-actions">
                                                <a href="/cadastro" class="btn btn-success">➕ Cadastrar Primeiro Produto</a>
                                            </div>
                                        `}
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>
                    
                    <script>
                        function toggleFiltrosPreco() {
                            const campo = document.getElementById('campo').value;
                            const filtroTexto = document.getElementById('filtro-texto');
                            const filtroPreco = document.getElementById('filtro-preco');
                            
                            if (campo === 'preco') {
                                filtroTexto.style.display = 'none';
                                filtroPreco.style.display = 'block';
                            } else if (campo === 'nome' || campo === 'descricao') {
                                filtroTexto.style.display = 'block';
                                filtroPreco.style.display = 'none';
                            } else {
                                filtroTexto.style.display = 'none';
                                filtroPreco.style.display = 'none';
                            }
                        }

                        function mudarItensPorPagina(limit) {
                            const url = new URL(window.location.href);
                            const params = new URLSearchParams(url.search);
                            params.set('limit', limit);
                            params.set('page', '1');
                            window.location.href = '/produtos-lista?' + params.toString();
                        }

                        // Inicializar filtros na carga da página
                        document.addEventListener('DOMContentLoaded', function() {
                            toggleFiltrosPreco();
                        });

                        async function deletarProduto(id) {
                            if (confirm('Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.')) {
                                try {
                                    const response = await fetch('/produtos/' + id, {
                                        method: 'DELETE'
                                    });
                                    
                                    if (response.ok) {
                                        alert('Produto excluído com sucesso!');
                                        location.reload();
                                    } else {
                                        const error = await response.json();
                                        alert('Erro ao excluir produto: ' + (error.error || 'Erro desconhecido'));
                                    }
                                } catch (error) {
                                    alert('Erro ao excluir produto: ' + error.message);
                                }
                            }
                        }
                    </script>
                    <script src="/script.js"></script>
                </body>
                </html>
            `);
        } catch (error) {
            console.error('Erro ao carregar página de lista:', error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Erro interno do servidor');
        }
    }

    static async paginaCadastro(req, res) {
        try {
            const css = fs.readFileSync(path.join(__dirname, '../public/style.css'), 'utf8');

            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Cadastrar Produto - Sistema de Produtos</title>
                <style>${css}</style>
            </head>
            <body>
                <div class="container">
                    <a href="/" class="back-link">← Voltar para a página inicial</a>
                    
                    <div class="card">
                        <div class="header">
                            <h1>➕ Cadastrar Novo Produto</h1>
                            <p>Escolha como deseja cadastrar o produto</p>
                        </div>

                        <!-- Opções de Cadastro -->
                        <div class="cadastro-options">
                            <a href="/cadastro-manual" class="option-card">
                                <div class="option-icon">⌨️</div>
                                <h3>Cadastro Manual</h3>
                                <p>Digite os dados do produto manualmente</p>
                                <button class="btn" type="button">Selecionar</button>
                            </a>
                            
                            <a href="/cadastro-qrcode" class="option-card">
                                <div class="option-icon">📱</div>
                                <h3>Via QR Code</h3>
                                <p>Escaneie o QR Code da nota fiscal</p>
                                <button class="btn btn-success" type="button">Selecionar</button>
                            </a>
                        </div>

                        <div class="dev-note">
                            <h4>💡 Dica Rápida</h4>
                            <p><strong>Cadastro Manual:</strong> Ideal para produtos sem nota fiscal ou cadastros únicos.</p>
                            <p><strong>Via QR Code:</strong> Mais rápido e preciso para produtos comprados com nota fiscal.</p>
                        </div>
                    </div>
                </div>
                <script src="/script.js"></script>
            </body>
            </html>
        `);
        } catch (error) {
            console.error('Erro ao carregar página de cadastro:', error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Erro interno do servidor');
        }
    }

    static async paginaCadastroManual(req, res) {
        try {
            const css = fs.readFileSync(path.join(__dirname, '../public/style.css'), 'utf8');

            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Cadastrar Produto Manualmente - Sistema de Produtos</title>
                <style>${css}</style>
            </head>
            <body>
                <div class="container">
                    <a href="/cadastro" class="back-link">← Voltar para opções de cadastro</a>
                    
                    <div class="card form-container">
                        <div class="header">
                            <h1>⌨️ Cadastrar Produto Manualmente</h1>
                            <p>Preencha os dados do produto abaixo</p>
                        </div>

                        <form id="formProduto" action="/produtos" method="POST">
                            <div class="form-group">
                                <label for="nome">Nome do Produto *</label>
                                <input type="text" id="nome" name="nome" required 
                                       placeholder="Ex: Placa mãe Asus i9">
                            </div>

                            <div class="form-group">
                                <label for="preco">Preço *</label>
                                <input type="number" id="preco" name="preco" step="0.01" required 
                                       placeholder="Ex: 788.90">
                            </div>

                            <div class="form-group">
                                <label for="descricao">Descrição</label>
                                <textarea id="descricao" name="descricao" 
                                          placeholder="Ex: PLC 8 slots DDR5 + i9 + Cooler"></textarea>
                            </div>

                            <div class="form-actions">
                                <button type="submit" class="btn btn-success">Cadastrar Produto</button>
                                <a href="/cadastro" class="btn btn-danger">Cancelar</a>
                            </div>
                        </form>
                    </div>
                </div>
                <script src="/script.js"></script>
            </body>
            </html>
        `);
        } catch (error) {
            console.error('Erro ao carregar página de cadastro manual:', error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Erro interno do servidor');
        }
    }

    static async paginaCadastroQrcode(req, res) {
        try {
            const css = fs.readFileSync(path.join(__dirname, '../public/style.css'), 'utf8');

            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Cadastrar via QR Code - Sistema de Produtos</title>
                <style>${css}</style>
            </head>
            <body>
                <div class="container">
                    <a href="/cadastro" class="back-link">← Voltar para opções de cadastro</a>
                    
                    <div class="card">
                        <div class="scanner-container">
                            <div class="header">
                                <h1>📱 Cadastrar via QR Code</h1>
                                <p>Escaneie o QR Code da nota fiscal para cadastrar produtos automaticamente</p>
                            </div>

                            <!-- Área do Scanner -->
                            <div id="reader">
                                <div class="scanner-placeholder">
                                    <div class="icon">📷</div>
                                    <h3>Área do Scanner de QR Code</h3>
                                    <p>Posicione o QR Code da nota fiscal dentro desta área</p>
                                    <button class="btn-scan" onclick="simularLeituraQRCode()">
                                        🎯 Simular Leitura (Demo)
                                    </button>
                                    <p><small>Funcionalidade em desenvolvimento</small></p>
                                </div>
                            </div>

                            <!-- Formulário pré-preenchido (inicialmente oculto) -->
                            <form id="formNfce" class="form-nfce" action="/produtos" method="POST">
                                <h3>✅ Produto Identificado - Confirme os Dados</h3>
                                
                                <div class="form-group">
                                    <label for="nomeNfce">Nome do Produto *</label>
                                    <input type="text" id="nomeNfce" name="nome" required 
                                           placeholder="Nome extraído do QR Code">
                                </div>

                                <div class="form-group">
                                    <label for="precoNfce">Preço *</label>
                                    <input type="number" id="precoNfce" name="preco" step="0.01" required 
                                           placeholder="Preço extraído do QR Code">
                                </div>

                                <div class="form-group">
                                    <label for="descricaoNfce">Descrição</label>
                                    <textarea id="descricaoNfce" name="descricao" 
                                              placeholder="Descrição adicional do produto"></textarea>
                                </div>

                                <div class="form-actions">
                                    <button type="submit" class="btn btn-success">✅ Confirmar Cadastro</button>
                                    <button type="button" class="btn btn-danger" onclick="limparFormulario()">🔄 Ler Outro QR Code</button>
                                </div>
                            </form>

                            <!-- Informações de desenvolvimento -->
                            <div class="debug-info">
                                <strong>🚧 Modo Desenvolvimento</strong>
                                <p>Esta funcionalidade simula a leitura de QR Code de notas fiscais.</p>
                                <p>Na versão final, será integrado com:</p>
                                <ul>
                                    <li>📱 Leitor real de QR Code</li>
                                    <li>🏢 Integração com SEFAZ</li>
                                    <li>📊 Extração automática de dados</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                
                <script>
                    function simularLeituraQRCode() {
                        // Dados simulados de uma NFC-e
                        const produtosDemo = [
                            {
                                nome: "Mouse Gamer RGB 7200DPI",
                                preco: 89.90,
                                descricao: "Mouse óptico com iluminação RGB"
                            },
                            {
                                nome: "Teclado Mecânico Redragon", 
                                preco: 249.90,
                                descricao: "Teclado mecânico switches blue"
                            },
                            {
                                nome: "Monitor LED 24'' Samsung",
                                preco: 799.90,
                                descricao: "Monitor Full HD 75Hz"
                            },
                            {
                                nome: "Headphone Wireless Sony",
                                preco: 299.90,
                                descricao: "Fone Bluetooth com cancelamento de ruído"
                            },
                            {
                                nome: "Webcam Full HD Logitech",
                                preco: 189.90,
                                descricao: "Webcam 1080p com microfone integrado"
                            }
                        ];
                        
                        // Seleciona um produto aleatório para demonstração
                        const produto = produtosDemo[Math.floor(Math.random() * produtosDemo.length)];
                        
                        // Preenche o formulário
                        document.getElementById('nomeNfce').value = produto.nome;
                        document.getElementById('precoNfce').value = produto.preco;
                        document.getElementById('descricaoNfce').value = produto.descricao;
                        
                        // Mostra o formulário
                        document.getElementById('formNfce').style.display = 'block';
                        
                        // Feedback visual
                        alert('✅ QR Code lido com sucesso! Produto identificado: ' + produto.nome);
                    }
                    
                    function limparFormulario() {
                        document.getElementById('formNfce').style.display = 'none';
                        document.getElementById('nomeNfce').value = '';
                        document.getElementById('precoNfce').value = '';
                        document.getElementById('descricaoNfce').value = '';
                    }
                    
                    // Simular leitura automática após 3 segundos (apenas para demo)
                    setTimeout(() => {
                        console.log('🔍 Scanner de QR Code inicializado (modo demo)');
                    }, 1000);
                </script>
                <script src="/script.js"></script>
            </body>
            </html>
        `);
        } catch (error) {
            console.error('Erro ao carregar página de QR Code:', error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Erro interno do servidor');
        }
    }

    static async paginaEditar(req, res, produtoId) {
        try {
            const produto = await Produto.findByPk(produtoId);
            if (!produto) {
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                return res.end(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Produto Não Encontrado</title>
                        <style>
                            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                            h1 { color: #dc3545; }
                            a { color: #007bff; text-decoration: none; }
                        </style>
                    </head>
                    <body>
                        <h1>Produto Não Encontrado</h1>
                        <p>O produto com ID ${produtoId} não foi encontrado.</p>
                        <p><a href="/">Voltar para a página inicial</a></p>
                    </body>
                    </html>
                `);
            }

            const css = fs.readFileSync(path.join(__dirname, '../public/style.css'), 'utf8');

            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Editar Produto - Sistema de Produtos</title>
                    <style>${css}</style>
                </head>
                <body>
                    <div class="container">
                        <a href="/produtos-lista" class="back-link">← Voltar para a lista de produtos</a>
                        
                        <div class="card form-container">
                            <div class="header">
                                <h1>✏️ Editar Produto</h1>
                                <p>Atualize os dados do produto abaixo</p>
                            </div>

                            <form id="formEditarProduto">
                                <div class="form-group">
                                    <label for="nome">Nome do Produto *</label>
                                    <input type="text" id="nome" name="nome" value="${produto.nome}" required 
                                           placeholder="Ex: Placa mãe Asus i9">
                                </div>

                                <div class="form-group">
                                    <label for="preco">Preço *</label>
                                    <input type="number" id="preco" name="preco" value="${produto.preco}" step="0.01" required 
                                           placeholder="Ex: 788.90">
                                </div>

                                <div class="form-group">
                                    <label for="descricao">Descrição</label>
                                    <textarea id="descricao" name="descricao" 
                                              placeholder="Ex: PLC 8 slots DDR5 + i9 + Cooler">${produto.descricao || ''}</textarea>
                                </div>

                                <div class="form-actions">
                                    <button type="submit" class="btn btn-success">Atualizar Produto</button>
                                    <a href="/produtos-lista" class="btn btn-danger">Cancelar</a>
                                </div>
                            </form>
                        </div>
                    </div>
                    <script>
                        document.getElementById('formEditarProduto').addEventListener('submit', async function(e) {
                            e.preventDefault();
                            
                            const formData = new FormData(this);
                            const produtoId = ${produto.id};
                            
                            try {
                                const response = await fetch('/produtos/' + produtoId, {
                                    method: 'PUT',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        nome: formData.get('nome'),
                                        preco: parseFloat(formData.get('preco')),
                                        descricao: formData.get('descricao')
                                    })
                                });
                                
                                if (response.ok) {
                                    window.location.href = '/sucesso';
                                } else {
                                    alert('Erro ao atualizar produto');
                                }
                            } catch (error) {
                                alert('Erro ao atualizar produto: ' + error.message);
                            }
                        });
                    </script>
                    <script src="/script.js"></script>
                </body>
                </html>
            `);
        } catch (error) {
            console.error('Erro ao carregar página de edição:', error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Erro interno do servidor');
        }
    }

    static async paginaConsultar(req, res, produtoId = null) {
        try {
            let produto = null;
            if (produtoId) {
                produto = await Produto.findByPk(produtoId);
            }

            const css = fs.readFileSync(path.join(__dirname, '../public/style.css'), 'utf8');

            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Consultar Produto - Sistema de Produtos</title>
                    <style>${css}</style>
                </head>
                <body>
                    <div class="container">
                        <a href="/" class="back-link">← Voltar para a página inicial</a>
                        
                        <div class="card form-container">
                            <div class="header">
                                <h1>🔍 Consultar Produto</h1>
                                <p>Consulte um produto pelo ID</p>
                            </div>

                            <form action="/consultar" method="GET" style="margin-bottom: 30px;">
                                <div class="form-group">
                                    <label for="id">ID do Produto</label>
                                    <input type="number" id="id" name="id" value="${produtoId || ''}" required 
                                           placeholder="Digite o ID do produto" min="1">
                                </div>
                                <div class="form-actions">
                                    <button type="submit" class="btn">Consultar</button>
                                </div>
                            </form>

                            ${produto ? `
                                <div class="produto-detalhes">
                                    <h3>📋 Detalhes do Produto</h3>
                                    <div class="produto-card">
                                        <div class="produto-header">
                                            <h3>${produto.nome}</h3>
                                            <span class="produto-id">#${produto.id}</span>
                                        </div>
                                        <div class="produto-body">
                                            <p class="produto-preco">R$ ${parseFloat(produto.preco).toFixed(2)}</p>
                                            <p class="produto-descricao">${produto.descricao || 'Sem descrição'}</p>
                                            <div class="produto-meta">
                                                <small><strong>Criado em:</strong> ${new Date(produto.createdAt).toLocaleString('pt-BR')}</small>
                                                <small><strong>Última atualização:</strong> ${new Date(produto.updatedAt).toLocaleString('pt-BR')}</small>
                                            </div>
                                        </div>
                                        <div class="produto-actions">
                                            <a href="/editar/${produto.id}" class="btn">✏️ Editar</a>
                                            <a href="/produtos-lista" class="btn">📦 Ver Todos</a>
                                        </div>
                                    </div>
                                </div>
                            ` : prodottoId ? `
                                <div class="message error">
                                    <h3>❌ Produto Não Encontrado</h3>
                                    <p>Não foi encontrado nenhum produto com o ID ${produtoId}.</p>
                                    <p><a href="/produtos-lista">Ver todos os produtos cadastrados</a></p>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    <script src="/script.js"></script>
                </body>
                </html>
            `);
        } catch (error) {
            console.error('Erro ao carregar página de consulta:', error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Erro interno do servidor');
        }
    }

    static async paginaSucesso(req, res) {
        try {
            const css = fs.readFileSync(path.join(__dirname, '../public/style.css'), 'utf8');

            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Operação Concluída - Sistema de Produtos</title>
                    <style>${css}</style>
                </head>
                <body>
                    <div class="container">
                        <div class="card form-container">
                            <div class="header">
                                <h1>✅ Operação Concluída com Sucesso!</h1>
                                <p>A ação foi executada com sucesso no sistema.</p>
                            </div>

                            <div class="message success">
                                <h3>Sucesso!</h3>
                                <p>A operação foi concluída com sucesso no banco de dados.</p>
                            </div>

                            <div class="form-actions">
                                <a href="/" class="btn btn-success">🏠 Página Inicial</a>
                                <a href="/produtos-lista" class="btn">📦 Ver Produtos</a>
                                <a href="/cadastro" class="btn">➕ Novo Produto</a>
                            </div>
                        </div>
                    </div>
                    
                    <script>
                        // Redirecionamento automático após 3 segundos
                        setTimeout(() => {
                            window.location.href = '/produtos-lista';
                        }, 3000);
                    </script>
                    <script src="/script.js"></script>
                </body>
                </html>
            `);
        } catch (error) {
            console.error('Erro ao carregar página de sucesso:', error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Erro interno do servidor');
        }
    }
}

module.exports = HtmlController;