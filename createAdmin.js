const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Importa seu modelo de User

// --- Credenciais do Admin ---
const ADMIN_USERNAME = 'invict_admin_9f3c';
const ADMIN_PASSWORD = 'r8$Wq9N7zF!pL4vX2yKc#3uT6mZ&1hS';
const ADMIN_EMAIL = 'admin@invict.com'; // Email de placeholder
// -----------------------------

// Conexão com o DB (mesma do seu server.js)
const MONGODB_URI = 'mongodb+srv://samuraytokyo0_db_user:xvuNLfOkcPWT16aV@invict.qngrwnt.mongodb.net/?appName=Invict';

async function createAdminUser() {
    console.log('Conectando ao MongoDB...');
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Conectado!');

        // 1. Verifica se o admin já existe
        const existingAdmin = await User.findOne({ 
            $or: [{ username: ADMIN_USERNAME }, { email: ADMIN_EMAIL }] 
        });
        
        if (existingAdmin) {
            console.warn('Usuário admin já existe no banco de dados.');
            mongoose.connection.close();
            return;
        }

        // 2. Criptografa a senha (extremamente seguro)
        console.log('Criptografando senha...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

        // 3. Cria o novo usuário admin
        const adminUser = new User({
            username: ADMIN_USERNAME,
            email: ADMIN_EMAIL,
            password: hashedPassword,
            provider: 'local',
            role: 'admin' // A parte mais importante!
        });

        // 4. Salva no banco de dados
        await adminUser.save();
        console.log('--- SUCESSO! ---');
        console.log(`Usuário admin '${ADMIN_USERNAME}' criado com sucesso.`);

    } catch (error) {
        console.error('--- ERRO AO CRIAR ADMIN ---');
        console.error(error);
    } finally {
        mongoose.connection.close();
        console.log('Desconectado do MongoDB.');
    }
}

// Executa a função
createAdminUser();