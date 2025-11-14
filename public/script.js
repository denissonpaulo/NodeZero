// Funções utilitárias para o frontend
document.addEventListener('DOMContentLoaded', function() {
    // Validação de formulário
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const requiredFields = form.querySelectorAll('[required]');
            let valid = true;

            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    valid = false;
                    field.style.borderColor = '#dc3545';
                } else {
                    field.style.borderColor = '#28a745';
                }
            });

            if (!valid) {
                e.preventDefault();
                alert('Por favor, preencha todos os campos obrigatórios.');
            }
        });
    });

    // Limpar mensagens de erro após digitação
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.value.trim()) {
                this.style.borderColor = '';
            }
        });
    });

    // Inicializar chatbot
    inicializarChatbot();
});

// ===== FUNÇÕES DO CHATBOT =====

function inicializarChatbot() {
    // Adicionar botão do chatbot ao body se não existir
    if (!document.getElementById('chatbotButton')) {
        const chatbotButton = document.createElement('button');
        chatbotButton.id = 'chatbotButton';
        chatbotButton.className = 'chatbot-button';
        chatbotButton.innerHTML = '💬 Precisa de Ajuda?';
        chatbotButton.onclick = openChatForm;
        document.body.appendChild(chatbotButton);
    }

    // Adicionar popup do chatbot se não existir
    if (!document.getElementById('chatForm')) {
        const chatPopup = document.createElement('div');
        chatPopup.id = 'chatForm';
        chatPopup.className = 'chat-popup';
        chatPopup.innerHTML = `
            <div class="chat-form-container">
                <h1 class="chat-header">🤖 Assistente Virtual</h1>
                <div class="chat-messages" id="chatMessages">
                    <div class="message bot">
                        <strong>Assistente:</strong> Olá! Como posso ajudar você hoje?
                    </div>
                </div>
                <form class="chat-form" id="messageForm">
                    <textarea placeholder="Digite sua mensagem aqui..." name="msg" required></textarea>
                    <div class="chat-actions">
                        <button type="submit" class="chat-btn">📤 Enviar</button>
                        <button type="button" class="chat-btn cancel" onclick="closeChatForm()">❌ Fechar</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(chatPopup);

        // Adicionar evento ao formulário do chat
        document.getElementById('messageForm').addEventListener('submit', function(e) {
            e.preventDefault();
            enviarMensagem();
        });
    }
}

function openChatForm() {
    document.getElementById('chatForm').style.display = 'block';
    document.getElementById('chatbotButton').style.display = 'none';
    // Focar no textarea
    const textarea = document.querySelector('#messageForm textarea');
    if (textarea) {
        textarea.focus();
    }
}

function closeChatForm() {
    document.getElementById('chatForm').style.display = 'none';
    document.getElementById('chatbotButton').style.display = 'block';
}

function enviarMensagem() {
    const textarea = document.querySelector('#messageForm textarea');
    const mensagem = textarea.value.trim();
    
    if (!mensagem) return;

    // Adicionar mensagem do usuário
    adicionarMensagem(mensagem, 'user');
    textarea.value = '';

    // Simular resposta do bot após um delay
    setTimeout(() => {
        const resposta = gerarResposta(mensagem);
        adicionarMensagem(resposta, 'bot');
    }, 1000);
}

function adicionarMensagem(texto, tipo) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${tipo}`;
    
    if (tipo === 'user') {
        messageDiv.innerHTML = `<strong>Você:</strong> ${texto}`;
    } else {
        messageDiv.innerHTML = `<strong>Assistente:</strong> ${texto}`;
    }
    
    chatMessages.appendChild(messageDiv);
    // Scroll para a última mensagem
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function gerarResposta(mensagem) {
    const msg = mensagem.toLowerCase();
    
    // Respostas baseadas em palavras-chave
    if (msg.includes('oi') || msg.includes('olá') || msg.includes('ola')) {
        return 'Olá! Bem-vindo ao Sistema de Produtos. Como posso ajudar você?';
    }
    
    if (msg.includes('cadastrar') || msg.includes('cadastro')) {
        return 'Para cadastrar um produto, clique em "Cadastrar Novo Produto" na página inicial. Você pode escolher entre cadastro manual ou via QR Code da nota fiscal.';
    }
    
    if (msg.includes('listar') || msg.includes('produtos') || msg.includes('lista')) {
        return 'Para ver todos os produtos, clique em "Ver Todos Produtos". Lá você pode filtrar por nome, descrição ou preço, e também editar ou excluir produtos.';
    }
    
    if (msg.includes('editar') || msg.includes('atualizar')) {
        return 'Para editar um produto, vá na lista de produtos e clique no botão "Editar" do produto desejado. Lá você pode modificar nome, preço e descrição.';
    }
    
    if (msg.includes('excluir') || msg.includes('deletar') || msg.includes('apagar')) {
        return 'Para excluir um produto, vá na lista de produtos e clique no botão "Excluir". Atenção: esta ação não pode ser desfeita!';
    }
    
    if (msg.includes('consultar') || msg.includes('buscar')) {
        return 'Para consultar um produto específico, use a opção "Consultar Produto por ID" na página inicial ou na lista de produtos.';
    }
    
    if (msg.includes('qr code') || msg.includes('qrcode')) {
        return 'O cadastro via QR Code permite escanear notas fiscais para preencher automaticamente os dados do produto. É mais rápido e evita erros de digitação!';
    }
    
    if (msg.includes('preço') || msg.includes('preco') || msg.includes('valor')) {
        return 'O preço do produto deve ser informado em formato numérico, com até duas casas decimais. Exemplo: 299.90';
    }
    
    if (msg.includes('obrigado') || msg.includes('obrigada') || msg.includes('valeu')) {
        return 'De nada! Estou aqui para ajudar. Se tiver mais alguma dúvida, é só perguntar! 😊';
    }
    
    // Resposta padrão
    return 'Entendi sua pergunta. Posso ajudar com: cadastro de produtos, listagem, edição, exclusão, consulta por ID e cadastro via QR Code. Sobre qual desses tópicos você gostaria de saber mais?';
}

// Fechar chat ao pressionar ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeChatForm();
    }
});