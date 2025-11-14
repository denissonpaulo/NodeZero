const Sequelize = require('sequelize');
const fs = require('fs');
const path = require('path');

// Criar diretório do banco com permissões adequadas para Linux
const bancoDir = path.join(__dirname, 'banco');
try {
    if (!fs.existsSync(bancoDir)) {
        fs.mkdirSync(bancoDir, { 
            recursive: true,
            mode: 0o755 // Permissões Linux
        });
        console.log('📁 Diretório do banco criado:', bancoDir);
    }
} catch (error) {
    console.error('❌ Erro ao criar diretório do banco:', error);
}

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(bancoDir, 'database.sqlite'),
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    retry: {
        max: 3
    }
});

// Testar conexão
sequelize.authenticate()
    .then(() => {
        console.log('✅ Conexão com SQLite estabelecida com sucesso');
    })
    .catch(error => {
        console.error('❌ Erro ao conectar com SQLite:', error);
    });

module.exports = sequelize;