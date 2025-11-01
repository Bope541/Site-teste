const express = require('express');
const session =require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Resend } = require('resend');

require('dotenv').config(); 
const Gerencianet = require('gn-api-sdk-node'); 
const fs = require('fs'); 

// --- MODELOS ---
const User = require('./models/User'); 
const Order = require('./models/Order');
const Product = require('./models/Product');
const Key = require('./models/Key');
const Coupon = require('./models/Coupon');
const Affiliate = require('./models/Affiliate');
const Category = require('./models/Category'); // (NOVO)

// --- CONFIGURAÇÃO DO BANCO DE DADOS ---
const MONGODB_URI = 'mongodb+srv://samuraytokyo0_db_user:xvuNLfOkcPWT16aV@invict.qngrwnt.mongodb.net/?appName=Invict';
mongoose.connect(MONGODB_URI, { }).then(() => {
    console.log('Conectado ao MongoDB!');
}).catch(err => console.error(err));

// --- CONFIGURAÇÃO DO RESEND ---
const resend = new Resend('re_NvRfyHrU_GeFXESPaZqX3Vm6s2SA78cTW');

// --- OPÇÕES DA EFI ---
// --- OPÇÕES DA EFI ---
// --- OPÇÕES DA EFI ---
const efiOptions = {
    sandbox: process.env.EFI_SANDBOX === 'true', 
    client_id: process.env.EFI_CLIENT_ID,        
    client_secret: process.env.EFI_CLIENT_SECRET,  
    certificate: process.env.EFI_CERTIFICADO_PATH // Isso vai ser ignorado na Discloud
};

let efi; 
try {
    // 1. Ele checa se está na Discloud (procurando o "texto gigante")
    if (process.env.EFI_CERTIFICADO_BASE64) {
        console.log("Carregando certificado EFI a partir do Base64 (Modo Discloud)...");
        const certBuffer = Buffer.from(process.env.EFI_CERTIFICADO_BASE64, 'base64');
        efiOptions.certificate = certBuffer; 
    } 
    // 2. Se não, ele checa se está no seu PC (procurando o "arquivo")
    else if (!efiOptions.certificate || !fs.existsSync(efiOptions.certificate)) {
        throw new Error(`Certificado não encontrado em: ${efiOptions.certificate}. Verifique seu .env e o caminho do arquivo.`);
    }
    
    efi = new Gerencianet(efiOptions); 
    console.log(`SDK da EFI inicializado. Modo Sandbox: ${efiOptions.sandbox}`);
} catch (error) {
    console.error('Erro CRÍTICO ao inicializar o SDK da EFI:');
    console.error(error.message);
    process.exit(1); 
}
// --- Helper de Validação de Senha ---
function isPasswordStrong(password) {
    const minLength = 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);
    return password.length >= minLength && hasUpper && hasLower && hasNumber && hasSymbol;
}

// --- APP E MIDDLEWARES ---
const app = express();
const port = process.env.PORT || 8080;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'umsegredomuitofortesupersecreto',
    resave: false,
    saveUninitialized: false
}));

// --- CONFIGURAÇÃO DO PASSPORT ---
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
    { usernameField: 'username_email' },
    async (username_email, password, done) => {
        try {
            const user = await User.findOne({
                $or: [{ email: username_email }, { username: username_email }]
            });
            if (!user) {
                return done(null, false, { message: 'Usuário ou senha inválidos.' });
            }
            if (user.provider === 'discord') {
                return done(null, false, { message: 'Esta conta foi registrada com o Discord. Faça login com o Discord.' });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return done(null, false, { message: 'Usuário ou senha inválidos.' });
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));
passport.use(new DiscordStrategy({
    clientID: '1433581384173092944',
    clientSecret: 'dTRG5D8WIqzSYnll6QqdeT3Kyuilm-U5',
    // (CORRIGIDO) Atualizado para a URL da Discloud (HTTPS é importante)
    callbackURL: 'https://invict.discloud.app/auth/discord/callback',
    scope: ['identify', 'email']
},
async (accessToken, refreshToken, profile, done) => {
    const { id, username, email, avatar } = profile;
    try {
        let user = await User.findOne({ discordId: id });
        if (user) {
            return done(null, user);
        }
        user = await User.findOne({ email: email });
        if (user) {
            user.discordId = id;
            user.avatar = avatar;
            user.provider = 'discord';
            await user.save();
            return done(null, user);
        }
        const newUser = new User({
            discordId: id,
            username: username,
            email: email,
            avatar: avatar,
            provider: 'discord',
        });
        await newUser.save();
        return done(null, newUser);
    } catch (err) {
        return done(err, null);
    }
}));
passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});


// --- Middleware para checar autenticação ---
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

// --- Middleware para checar se é Admin ---
function isAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        return next(); 
    }
    console.warn(`[Segurança] Tentativa de acesso não autorizado à /admin por: ${req.user ? req.user.username : 'Guest'}`);
    res.redirect('/');
}

// --- (NOVO) Middleware para checar se é Afiliado ---
async function isAffiliate(req, res, next) {
    if (!req.isAuthenticated()) {
         return res.status(401).json({ message: 'Não autorizado' });
    }
    try {
        const affiliate = await Affiliate.findOne({ user: req.user.id, status: 'active' });
        if (!affiliate) {
            return res.status(403).json({ message: 'Acesso negado. Você não é um afiliado ativo.' });
        }
        req.affiliate = affiliate; // Anexa os dados do afiliado ao request
        next();
    } catch (err) {
        res.status(500).json({ message: 'Erro interno' });
    }
}


// --- ROTAS DE ARQUIVOS ESTÁTICOS E PÁGINAS ---
app.use(express.static(path.join(__dirname, '/')));

app.get('/login', (req, res) => {
    if (req.isAuthenticated()) return res.redirect('/');
    res.sendFile(path.join(__dirname, 'login.html'));
});
app.get('/register', (req, res) => {
    if (req.isAuthenticated()) return res.redirect('/');
    res.sendFile(path.join(__dirname, 'register.html'));
});
app.get('/forgot-password', (req, res) => {
    if (req.isAuthenticated()) return res.redirect('/');
    res.sendFile(path.join(__dirname, 'forgot-password.html'));
});
app.get('/pagamento-pix.html', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'pagamento-pix.html'));
});

// --- Rotas de Conta de Usuário ---
app.get('/minha-conta', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'minha-conta.html'));
});
app.get('/meus-pedidos', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'meus-pedidos.html'));
});
app.get('/pedido-detalhes', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'pedido-detalhes.html'));
});

// --- (NOVA) Rota do Painel de Afiliado ---
app.get('/affiliate-dashboard.html', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'affiliate-dashboard.html'));
});


// --- ROTAS DO PAINEL ADMIN ---
app.get('/admin', isAuthenticated, isAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});
app.get('/admin/products', isAuthenticated, isAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-products.html'));
});
app.get('/admin/coupons', isAuthenticated, isAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-coupons.html'));
});
app.get('/admin/affiliates', isAuthenticated, isAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-affiliates.html'));
});
app.get('/admin/withdrawals', isAuthenticated, isAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-withdrawals.html'));
});
// (NOVA) Rota da página de Categorias
app.get('/admin/categories', isAuthenticated, isAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-categories.html'));
});


// --- ROTAS DE AUTENTICAÇÃO ---
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    console.log(`[Registro] Tentativa de registro para: ${email}`);
    const redirectWithError = (message) => {
        console.log(`[Registro] Erro: ${message}`);
        return res.redirect(`/register?error=${encodeURIComponent(message)}`);
    }
    if (!username || !email || !password) {
        return redirectWithError('Por favor, preencha todos os campos.');
    }
    if (!isPasswordStrong(password)) {
        return redirectWithError('Sua senha não atende aos requisitos mínimos de segurança.');
    }
    try {
        let user = await User.findOne({ $or: [{ email: email }, { username: username }] });
        if (user) {
            return redirectWithError('Email ou nome de usuário já cadastrado.');
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        user = new User({
            username,
            email,
            password: hashedPassword,
            provider: 'local',
        });
        await user.save();
        console.log(`[Registro] Usuário salvo no DB. Fazendo login automático...`);
        req.logIn(user, (err) => {
            if (err) {
                console.error("[Registro] Erro no auto-login:", err);
                return res.redirect('/login');
            }
            console.log(`[Registro] Auto-login com sucesso. Redirecionando para /`);
            return res.redirect('/');
        });
    } catch (err) {
        console.error("[Registro] Erro de Servidor/DB:", err);
        if (err.code === 11000) {
             return redirectWithError('Email ou nome de usuário já cadastrado.');
        }
        return redirectWithError('Erro interno do servidor. Tente mais tarde.');
    }
});
app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) { return next(err); }
        if (!user) {
            const errorMsg = info.message || 'Falha no login.';
            return res.redirect(`/login?error=${encodeURIComponent(errorMsg)}`);
        }
        req.logIn(user, (err) => {
            if (err) { return next(err); }
            if (user.role === 'admin') {
                console.log(`[Login] Admin ${user.username} logado. Redirecionando para /admin`);
                return res.redirect('/admin'); 
            }
            console.log(`[Login] Usuário ${user.username} logado. Redirecionando para /`);
            return res.redirect('/'); 
        });
    })(req, res, next);
});
app.get('/auth/discord', passport.authenticate('discord'));
app.get('/auth/discord/callback',
    passport.authenticate('discord', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/');
    }
);
app.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect('/');
    });
});


// --- ROTAS DE API (ESQUECEU A SENHA) ---
app.post('/api/request-reset', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email: email, provider: 'local' });
        if (user) {
            const code = crypto.randomInt(100000, 999999).toString();
            const expires = Date.now() + 10 * 60 * 1000; 
            const salt = await bcrypt.genSalt(10);
            user.resetPasswordCode = await bcrypt.hash(code, salt);
            user.resetPasswordExpires = expires;
            await user.save();
            try {
                const { data, error } = await resend.emails.send({
                    from: 'Invict <onboarding@resend.dev>',
                    to: user.email,
                    subject: 'Seu código de recuperação de senha - Invict',
                    html: `<h1>Recuperação de Senha - Invict</h1><p>Seu código de 6 dígitos é:</p><h2 style="font-size: 2.5rem; letter-spacing: 5px;">${code}</h2><p>Este código expira em 10 minutos.</p>`
                });
                if (error) { throw error; }
                console.log(`[Reset Senha] Código enviado para ${user.email}. ID Resend: ${data.id}`);
            } catch (emailError) {
                console.error("[Reset Senha] Erro ao enviar email:", emailError);
                return res.status(500).json({ message: 'Erro ao enviar email. Tente mais tarde.' });
            }
        } else {
            console.log(`[Reset Senha] Tentativa de reset para e-mail não existente: ${email}`);
        }
        res.json({ success: true });
    } catch (err) {
        console.error("[Reset Senha] Erro:", err);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});
app.post('/api/verify-code', async (req, res) => {
    const { email, code } = req.body;
    try {
        const user = await User.findOne({
            email: email,
            provider: 'local',
            resetPasswordExpires: { $gt: Date.now() } 
        });
        if (!user) {
            return res.status(400).json({ message: 'Código expirado ou inválido.' });
        }
        const isMatch = await bcrypt.compare(code, user.resetPasswordCode);
        if (!isMatch) {
            return res.status(400).json({ message: 'Código incorreto.' });
        }
        res.json({ success: true, username: user.username });
    } catch (err) {
        console.error("[Reset Senha] Erro ao verificar código:", err);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});
app.post('/api/set-new-password', async (req, res) => {
    const { email, code, newPassword } = req.body;
    if (!isPasswordStrong(newPassword)) {
        return res.status(400).json({ message: 'Sua senha não atende aos requisitos mínimos de segurança.' });
    }
    try {
        const user = await User.findOne({
            email: email,
            provider: 'local',
            resetPasswordExpires: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({ message: 'Sessão de redefinição inválida. Tente novamente.' });
        }
        const isMatch = await bcrypt.compare(code, user.resetPasswordCode);
        if (!isMatch) {
            return res.status(400).json({ message: 'Sessão de redefinição inválida. Tente novamente.' });
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetPasswordCode = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        console.log(`[Reset Senha] Senha redefinida com sucesso para ${user.email}`);
        res.json({ success: true });
    } catch (err) {
        console.error("[Reset Senha] Erro ao salvar:", err);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});


// --- ROTAS DE API DA CONTA ---
app.get('/api/account/info', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }
        const userObject = user.toObject();
        delete userObject.password; 
        delete userObject.resetPasswordCode;
        delete userObject.resetPasswordExpires;

        res.json(userObject);
    } catch (err) {
        console.error("Erro ao buscar dados da conta:", err);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});
app.post('/api/account/redeem', isAuthenticated, async (req, res) => {
    const { keyString } = req.body;
    const userId = req.user.id;

    if (!keyString) {
        return res.status(400).json({ message: 'Por favor, insira uma chave.' });
    }

    try {
        const key = await Key.findOne({ keyString: keyString.toUpperCase() });

        if (!key) {
            return res.status(404).json({ message: 'Chave inválida ou não encontrada.' });
        }
        if (key.isRedeemed) {
            return res.status(400).json({ message: 'Esta chave já foi resgatada.' });
        }

        let expiresAt = null;
        if (key.durationInDays > 0) {
            expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + key.durationInDays);
        } else if (key.durationInDays === -1) {
            expiresAt = new Date();
            expiresAt.setFullYear(expiresAt.getFullYear() + 100);
        }

        const newSubscription = {
            productName: key.productName,
            planName: key.planName,
            expiresAt: expiresAt,
            keyUsed: key.keyString
        };

        key.isRedeemed = true;
        key.redeemedBy = userId;
        key.redeemedAt = new Date();
        
        await key.save();
        
        await User.findByIdAndUpdate(
            userId,
            { $push: { activeSubscriptions: newSubscription } },
            { new: true } 
        );

        res.status(200).json({ 
            message: 'Chave resgatada com sucesso!', 
            subscription: newSubscription 
        });

    } catch (err) {
        console.error("Erro ao resgatar key:", err);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});
app.get('/api/account/orders', isAuthenticated, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Erro ao buscar pedidos.' });
    }
});
app.get('/api/account/orders/:id', isAuthenticated, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Pedido não encontrado.' });
        }
        if (order.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Acesso negado.' });
        }
        
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: 'Erro ao buscar pedido.' });
    }
});


// --- ROTA DE API PARA VALIDAR CUPOM ---
app.post('/api/validate-coupon', isAuthenticated, async (req, res) => {
    const { couponCode, productId, subtotal } = req.body; 

    try {
        const coupon = await Coupon.findOne({ code: couponCode });

        // 1. Validações Básicas
        if (!coupon) {
            return res.status(404).json({ message: 'Cupom não encontrado.' });
        }
        if (!coupon.isActive) {
            return res.status(400).json({ message: 'Este cupom está desativado.' });
        }
        if (coupon.expiresAt && coupon.expiresAt < new Date()) {
            return res.status(400).json({ message: 'Este cupom expirou.' });
        }
        if (coupon.maxUses && coupon.uses >= coupon.maxUses) { 
            return res.status(400).json({ message: 'Este cupom atingiu o limite de usos.' });
        }
        if (subtotal < coupon.minPurchase) {
            return res.status(400).json({ message: `Esta compra não atingiu o valor mínimo de R$ ${(coupon.minPurchase / 100).toFixed(2)}.` });
        }

        // 2. Validação de Produto
        if (coupon.applicableProducts && coupon.applicableProducts.length > 0) {
            const isApplicable = coupon.applicableProducts.some(id => id.toString() === productId);
            if (!isApplicable) {
                return res.status(400).json({ message: 'Este cupom não é válido para este produto.' });
            }
        }

        // 3. Calcular Desconto
        let discountAmount = 0; 
        if (coupon.discountType === 'percentage') {
            discountAmount = Math.round(subtotal * (coupon.discountValue / 100));
        } else { // 'fixed'
            discountAmount = coupon.discountValue;
        }
        
        if (discountAmount > subtotal) {
            discountAmount = subtotal;
        }

        res.json({
            message: 'Cupom aplicado com sucesso!',
            discountAmount: discountAmount,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue
        });

    } catch (error) {
        console.error("Erro ao validar cupom:", error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});


// --- ROTAS DE API (Status e PAGAMENTO) ---

// (ROTA ATUALIZADA) /api/auth/status
app.get('/api/auth/status', async (req, res) => {
    if (req.isAuthenticated()) {
        
        const affiliate = await Affiliate.findOne({ user: req.user.id, status: 'active' });

        res.json({
            loggedIn: true,
            user: {
                username: req.user.username,
                avatar: req.user.avatar,
                discordId: req.user.discordId
            },
            isAffiliate: !!affiliate 
        });
    } else {
        res.json({ loggedIn: false });
    }
});

// (ROTA ATUALIZADA) /criar-pagamento
app.post('/criar-pagamento', isAuthenticated, async (req, res) => {
    console.log('[Pagamento] Recebida requisição /criar-pagamento');
    
    const { 
        full_name, cpf, email, 
        productId, productTitle, productPlan, 
        productPrice, 
        couponApplied,
        discountAmount,
        finalTotal
    } = req.body;
    
    const userId = req.user.id; 

    if (!full_name || !cpf || !email || !productId || !productTitle || !productPlan || !productPrice || !finalTotal) {
        return res.status(400).send('Dados incompletos. Volte e tente novamente.');
    }
    
    const orderNumber = `INV-${Date.now().toString().slice(-6)}`;
    
    let finalAmountInCents = 0;
    let subtotalInCents = Math.round(parseFloat(productPrice.replace(',', '.')) * 100);
    let discountInCents = 0;

    try {
        let coupon = null; 
        if (couponApplied) {
            coupon = await Coupon.findOne({ code: couponApplied });
            
            if (!coupon || !coupon.isActive || (coupon.expiresAt && coupon.expiresAt < new Date()) || (coupon.maxUses && coupon.uses >= coupon.maxUses) || subtotalInCents < coupon.minPurchase) {
                throw new Error('Cupom inválido ou expirado.');
            }
            if (coupon.applicableProducts && coupon.applicableProducts.length > 0) {
                 const isApplicable = coupon.applicableProducts.some(id => id.toString() === productId);
                 if (!isApplicable) throw new Error('Cupom não aplicável a este produto.');
            }

            if (coupon.discountType === 'percentage') {
                discountInCents = Math.round(subtotalInCents * (coupon.discountValue / 100));
            } else {
                discountInCents = coupon.discountValue;
            }
            
            if (discountInCents > subtotalInCents) discountInCents = subtotalInCents;

            let frontendDiscountCents = Math.round(parseFloat(discountAmount.replace(',', '.')) * 100);
            if (discountInCents !== frontendDiscountCents) {
                console.error(`[SEGURANÇA] Disparidade de cupom! Server: ${discountInCents} | Client: ${frontendDiscountCents}`);
                throw new Error('Disparidade no valor do cupom.');
            }
        }
        
        finalAmountInCents = subtotalInCents - discountInCents;
        
        let frontendTotalCents = Math.round(parseFloat(finalTotal.replace(',', '.')) * 100);
        if(finalAmountInCents !== frontendTotalCents) {
             console.error(`[SEGURANÇA] Disparidade de total! Server: ${finalAmountInCents} | Client: ${frontendTotalCents}`);
             throw new Error('Disparidade no valor total.');
        }

        const valorStringEfi = (finalAmountInCents / 100).toFixed(2);
        
        const newOrder = new Order({
            user: userId,
            productId: productId,
            orderNumber: orderNumber,
            productTitle: productTitle,
            productPlan: productPlan,
            subtotal: subtotalInCents,
            couponApplied: couponApplied,
            discountAmount: discountInCents,
            amount: finalAmountInCents,
            status: 'pending',
            customer: {
                name: full_name,
                cpf: cpf.replace(/\D/g, ''),
                email: email
            }
        });

        if (finalAmountInCents <= 0) {
             console.log(`[Pagamento] Pedido ${orderNumber} é R$ 0,00. Processando como pago.`);
             await newOrder.save();
             await processAndDeliverOrder(newOrder);
             
             if (coupon) {
                coupon.uses += 1;
                await coupon.save();
                console.log(`[Cupom] Uso do cupom ${couponApplied} incrementado.`);
             }
             return res.redirect(`/pedido-detalhes.html?id=${newOrder._id}`);
        }

        const body = {
            calendario: { expiracao: 3600 },
            devedor: { cpf: cpf.replace(/\D/g, ''), nome: full_name },
            valor: { original: valorStringEfi },
            chave: CHAVE_PIX, // <-- (CORRIGIDO) Usa a variável global
            solicitacaoPagador: `Invict - ${productTitle}`
        };

        console.log(`[EFI] Criando cobrança PIX no valor de R$ ${valorStringEfi}...`);
        const pixCharge = await efi.pixCreateImmediateCharge({}, body);
        
        newOrder.txid = pixCharge.txid;
        newOrder.pixCopiaECola = pixCharge.pixCopiaECola;
        newOrder.pixQrCodeImage = pixCharge.loc.id ? (await efi.pixGenerateQRCode({ id: pixCharge.loc.id })).imagemQrcode : null;
        
        await newOrder.save();
        
        if (coupon) {
            coupon.uses += 1;
            await coupon.save();
            console.log(`[Cupom] Uso do cupom ${couponApplied} incrementado.`);
        }

        console.log(`[DB] Pedido ${newOrder.id} (${orderNumber}) salvo com dados do PIX.`);
        res.redirect(`/pagamento-pix.html?orderId=${newOrder.id}`);

    } catch (error) {
        console.error('Erro ao criar pagamento PIX:', error.response ? error.response.data : error.message);
        res.status(500).send(`Erro ao gerar o pagamento: ${error.message}`);
    }
});

app.get('/api/order-details/:orderId', isAuthenticated, async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order || order.user.toString() !== req.user.id) {
            return res.status(404).json({ message: 'Pedido não encontrado.' });
        }
        res.json({
            status: order.status,
            pixCopiaECola: order.pixCopiaECola,
            pixQrCodeImage: order.pixQrCodeImage,
            productTitle: order.productTitle,
            productPlan: order.productPlan,
            amount: (order.amount / 100).toFixed(2)
        });
    } catch (error) {
        console.error('Erro ao buscar detalhes do pedido:', error);
        res.status(500).json({ message: 'Erro interno.' });
    }
});

// (ROTA ATUALIZADA) /api/order-status/:orderId
app.get('/api/order-status/:orderId', isAuthenticated, async (req, res) => {
    try {
        let order = await Order.findById(req.params.orderId);
        if (!order || order.user.toString() !== req.user.id) {
            return res.status(404).json({ message: 'Pedido não encontrado.' });
        }

        if (order.status === 'pending' && order.txid) {
            console.log(`[Polling] Verificando status na EFI para txid: ${order.txid}`);
            try {
                const charge = await efi.pixDetailCharge({ txid: order.txid });
                
                if (charge.status === 'CONCLUIDA') {
                    console.log(`[Polling] Pagamento ${order.txid} confirmado pela EFI.`);
                    
                    await processAndDeliverOrder(order);
                    
                    order = await Order.findById(req.params.orderId); 
                    
                }
            } catch (efiError) {
                console.error(`[Polling] Erro ao consultar EFI: ${efiError.message}`);
            }
        }
        
        res.json({ status: order.status }); 
        
    } catch (error) {
        res.status(500).json({ message: 'Erro interno.' });
    }
});

// ***** (FUNÇÃO ATUALIZADA) processAndDeliverOrder *****
async function processAndDeliverOrder(order) {
    if (!order || order.status !== 'pending') {
        console.log(`[Entrega] Pedido ${order._id} já processado ou inválido. Status: ${order.status || 'N/A'}`);
        return false;
    }

    console.log(`[Entrega] Processando entrega para o Pedido: ${order._id}`);

    try {
        const product = await Product.findById(order.productId);
        if (!product) {
            throw new Error(`Produto ${order.productId} não encontrado para o pedido ${order.id}`);
        }

        const keyIndex = product.keys.findIndex(k => !k.isSold);

        if (keyIndex === -1) {
            console.error(`[CRÍTICO] SEM ESTOQUE para o produto ${product.name} (ID: ${product._id})! Pedido ${order.id} foi pago mas não pôde ser entregue.`);
            order.status = 'paid';
            order.assignedKey = 'SEM_ESTOQUE_CONTATAR_SUPORTE';
            await order.save();
            return false;
        }

        const assignedKeyStock = product.keys[keyIndex];
        product.keys[keyIndex].isSold = true;
        product.keys[keyIndex].soldTo = order.user;
        product.keys[keyIndex].orderId = order._id;

        order.assignedKey = assignedKeyStock.key;
        order.status = 'paid';

        const plan = product.plans.find(p => p.name === order.productPlan);
        let duration = 0;
        if (plan) {
            if (plan.name === '1 Semana') duration = 7;
            else if (plan.name === '1 Mês') duration = 30;
            else if (plan.name === '3 Meses') duration = 90;
            else if (plan.name === 'Vitalicio') duration = -1;
        }

        if (duration !== 0) {
            const newKeyForRedemption = new Key({
                keyString: assignedKeyStock.key,
                productName: order.productTitle,
                planName: order.productPlan,
                durationInDays: duration,
                isRedeemed: false 
            });
            
            try {
                await newKeyForRedemption.save();
                console.log(`[Entrega] Key ${newKeyForRedemption.keyString} registrada na coleção 'Key' para resgate.`);
            } catch (keyError) {
                console.warn(`[Entrega] Aviso: Não foi possível salvar a key ${assignedKeyStock.key} na coleção 'Key' (pode já existir). Erro: ${keyError.message}`);
            }
            
        } else {
            console.warn(`[Entrega] Pedido ${order.id} não tem duração definida. A key não foi registrada para resgate.`);
        }
        
        // --- (ATUALIZADO) LÓGICA DE COMISSÃO DE AFILIADO ---
        let affiliateId = null; 
        if (order.couponApplied && order.amount > 0) {
            console.log(`[Afiliado] Pedido ${order.id} usou o cupom: ${order.couponApplied}. Verificando...`);
            const coupon = await Coupon.findOne({ code: order.couponApplied });
            if (coupon) {
                const affiliate = await Affiliate.findOne({ linkedCoupons: coupon._id, status: 'active' });
                
                if (affiliate) {
                    affiliateId = affiliate._id; 
                    const commissionRate = affiliate.commissionRate / 100;
                    const commissionAmount = Math.round(order.amount * commissionRate);
                    
                    affiliate.balance += commissionAmount;
                    affiliate.totalEarned += commissionAmount;
                    await affiliate.save();
                    
                    console.log(`[Afiliado] COMISSÃO REGISTRADA! Afiliado: ${affiliate.fullName}. Valor: R$ ${(commissionAmount / 100).toFixed(2)}`);
                } else {
                    console.log(`[Afiliado] Cupom ${order.couponApplied} não pertence a nenhum afiliado ativo.`);
                }
            }
        }
        // --- FIM DA LÓGICA DE COMISSÃO ---

        // (NOVO) Salva o ID do afiliado no pedido
        order.commissionPaidTo = affiliateId;

        await product.save();
        await order.save(); // Salva o pedido como 'paid' E com o ID do afiliado

        console.log(`[DB] Pedido ${order.id} atualizado para PAGO. Chave ${assignedKeyStock.key} entregue ao usuário (pronta para resgate).`);
        return true;
        
    } catch (error) {
        console.error(`[Entrega] Erro CRÍTICO ao processar entrega para o pedido ${order._id}:`, error);
        try {
            order.status = 'paid';
            order.assignedKey = 'ERRO_NA_ENTREGA_VERIFICAR_LOGS';
            await order.save();
        } catch (saveError) {
            console.error(`[Entrega] Não foi possível nem salvar o pedido ${order._id} com erro.`, saveError);
        }
        return false;
    }
}

// (ROTA ATUALIZADA) /webhook/pix
app.post('/webhook/pix', async (req, res) => {
    console.log('[WEBHOOK] Notificação PIX recebida!');
    const { pix } = req.body;
    if (!pix || !pix[0]) {
        return res.status(400).send('Requisição inválida');
    }
    const txid = pix[0].txid;
    console.log(`[WEBHOOK] Processando TXID: ${txid}`);
    
    try {
        const charge = await efi.pixDetailCharge({ txid: txid });

        if (charge.status === 'CONCLUIDA') {
            console.log(`[WEBHOOK] Pagamento ${txid} CONCLUÍDO.`);
            
            const order = await Order.findOne({ txid: txid, status: 'pending' });
            
            if (order) {
                await processAndDeliverOrder(order);
            } else {
                console.log(`[WEBHOOK] Pedido com TXID ${txid} já processado ou não encontrado.`);
            }
        } else {
            console.log(`[WEBHOOK] TXID ${txid} ainda não concluído (Status EFI: ${charge.status})`);
        }
        res.status(200).send('OK');
    } catch (error) {
        console.error('Erro no webhook PIX:', error.response ? error.response.data : error.message);
        res.status(500).send('Erro no processamento');
    }
});


// --- (NOVA) ROTA PÚBLICA DA API DE CATEGORIAS ---
app.get('/api/public/categories', async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- ROTAS DA API DE PRODUTOS (PÚBLICAS) ---

// (ATUALIZADA) Rota /api/products (agora popula a categoria)
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().select(
            'name slug category imageUrls plans rating isDetectado'
        ).populate('category', 'name slug'); // <-- MUDANÇA AQUI
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// (ATUALIZADA) Rota /api/products/slug/:slug (agora popula a categoria)
app.get('/api/products/slug/:slug', async (req, res) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug })
            .populate('category'); // <-- MUDANÇA AQUI
        if (!product) {
            return res.status(440).json({ message: 'Produto não encontrado' });
        }
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// (ATUALIZADA) Rota /api/products/id/:id (agora popula a categoria)
app.get('/api/products/id/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category'); // <-- MUDANÇA AQUI
        if (!product) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// --- ROTAS DA API DE PRODUTOS (ADMIN) ---

// (ATUALIZADA) Rota /api/admin/products (agora popula a categoria)
app.get('/api/admin/products', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const products = await Product.find()
            .populate('category', 'name'); // <-- MUDANÇA AQUI
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
app.post('/api/admin/products', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Erro: Já existe um produto com este nome (slug duplicado).' });
        }
        res.status(400).json({ message: err.message });
    }
});
app.put('/api/admin/products/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }
        res.json(product);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Erro: Já existe um produto com este nome (slug duplicado).' });
        }
        res.status(400).json({ message: err.message });
    }
});
app.delete('/api/admin/products/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }
        res.json({ message: 'Produto deletado com sucesso' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- (NOVAS) ROTAS DA API DE CATEGORIAS (ADMIN) ---

// GET /api/admin/categories
app.get('/api/admin/categories', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/admin/categories
app.post('/api/admin/categories', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const newCategory = new Category({ name: req.body.name });
        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Erro: Já existe uma categoria com este nome.' });
        }
        res.status(400).json({ message: err.message });
    }
});

// PUT /api/admin/categories/:id
app.put('/api/admin/categories/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true, runValidators: true });
        if (!category) {
            return res.status(404).json({ message: 'Categoria não encontrada' });
        }
        res.json(category);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Erro: Já existe um categoria com este nome.' });
        }
        res.status(400).json({ message: err.message });
    }
});

// DELETE /api/admin/categories/:id
app.delete('/api/admin/categories/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        // (NOVO) Antes de deletar, verifica se algum produto usa esta categoria
        const productCount = await Product.countDocuments({ category: req.params.id });
        if (productCount > 0) {
            return res.status(400).json({ message: `Não é possível deletar esta categoria, pois ${productCount} produto(s) estão a usá-la. Reatribua os produtos primeiro.` });
        }
        
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Categoria não encontrada' });
        }
        res.json({ message: 'Categoria deletada com sucesso' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- ROTAS DA API DE CUPONS (ADMIN) ---
app.get('/api/admin/coupons', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.json(coupons);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
app.get('/api/admin/coupons/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            return res.status(404).json({ message: 'Cupom não encontrado' });
        }
        res.json(coupon);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
app.post('/api/admin/coupons', isAuthenticated, isAdmin, async (req, res) => {
    try {
        if (!req.body.maxUses) req.body.maxUses = null;
        if (!req.body.expiresAt) req.body.expiresAt = null;
        
        const newCoupon = new Coupon(req.body);
        await newCoupon.save();
        res.status(201).json(newCoupon);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Erro: Já existe um cupom com este código.' });
        }
        res.status(400).json({ message: err.message });
    }
});
app.put('/api/admin/coupons/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        if (!req.body.maxUses) req.body.maxUses = null;
        if (!req.body.expiresAt) req.body.expiresAt = null;
        
        const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!coupon) {
            return res.status(404).json({ message: 'Cupom não encontrado' });
        }
        res.json(coupon);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Erro: Já existe um cupom com este código.' });
        }
        res.status(400).json({ message: err.message });
    }
});
app.delete('/api/admin/coupons/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.id);
        if (!coupon) {
            return res.status(404).json({ message: 'Cupom não encontrado' });
        }
        res.json({ message: 'Cupom deletado com sucesso' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// --- (ATUALIZADAS) ROTAS DA API DE AFILIADOS (ADMIN) ---
app.get('/api/admin/affiliates', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const affiliates = await Affiliate.find()
            .populate('user', 'username email') 
            .populate('linkedCoupons', 'code') 
            .sort({ createdAt: -1 });
        res.json(affiliates);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
app.get('/api/admin/affiliates/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const affiliate = await Affiliate.findById(req.params.id)
            .populate('user', 'username email')
            .populate('linkedCoupons', '_id');
        
        if (!affiliate) {
            return res.status(404).json({ message: 'Afiliado não encontrado' });
        }
        res.json(affiliate);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
app.post('/api/admin/affiliates', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { username, fullName, paymentDetails, ...rest } = req.body;

        const user = await User.findOne({ username: username });
        if (!user) {
            return res.status(404).json({ message: `Usuário '${username}' não encontrado no banco de dados.` });
        }
        
        const existingAffiliate = await Affiliate.findOne({ user: user._id });
        if (existingAffiliate) {
            return res.status(400).json({ message: 'Este usuário já está cadastrado como afiliado.' });
        }
        
        const newAffiliate = new Affiliate({
            ...rest,
            user: user._id,
            fullName: fullName,
            paymentDetails: paymentDetails 
        });
        
        await newAffiliate.save();
        res.status(201).json(newAffiliate);
    } catch (err) {
        console.error("Erro ao criar afiliado:", err);
        if (err.name === 'ValidationError') {
             return res.status(400).json({ message: `Erro de validação: ${err.message}` });
        }
        res.status(400).json({ message: err.message });
    }
});
app.put('/api/admin/affiliates/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { username, user, ...updateData } = req.body;
        
        const affiliate = await Affiliate.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
        if (!affiliate) {
            return res.status(404).json({ message: 'Afiliado não encontrado' });
        }
        res.json(affiliate);
    } catch (err) {
        if (err.name === 'ValidationError') {
             return res.status(400).json({ message: `Erro de validação: ${err.message}` });
        }
        res.status(400).json({ message: err.message });
    }
});
app.delete('/api/admin/affiliates/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const affiliate = await Affiliate.findByIdAndDelete(req.params.id);
        if (!affiliate) {
            return res.status(404).json({ message: 'Afiliado deletado com sucesso' });
        }
        res.json({ message: 'Afiliado deletado com sucesso' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// --- (NOVA) ROTA DA API DO DASHBOARD (ADMIN) ---
app.get('/api/admin/dashboard-stats', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { start, end } = req.query;

        // --- 1. Lógica de Filtro de Data ---
        const dateFilter = {};
        if (start) {
            dateFilter.$gte = new Date(new Date(start).setHours(0, 0, 0, 0));
        }
        if (end) {
            dateFilter.$lte = new Date(new Date(end).setHours(23, 59, 59, 999));
        }
        const hasDateFilter = Object.keys(dateFilter).length > 0;

        // --- 2. Queries (executadas em paralelo) ---
        const totalSalesPromise = Order.aggregate([
            { $match: { status: 'paid' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const filteredSalesPromise = Order.aggregate([
            { 
                $match: { 
                    status: 'paid',
                    ...(hasDateFilter && { createdAt: dateFilter }) 
                } 
            },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const couponsUsedPromise = Order.countDocuments({
            status: 'paid',
            couponApplied: { $ne: null },
            ...(hasDateFilter && { createdAt: dateFilter })
        });
        
        const newUsersPromise = User.countDocuments({
             ...(hasDateFilter && { createdAt: dateFilter })
        });

        const recentOrdersPromise = Order.find({ status: 'paid' })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('user', 'username');

        // --- 3. Executar todas as queries ---
        const [
            totalSalesResult,
            filteredSalesResult,
            couponsUsed,
            newUsers,
            recentOrders
        ] = await Promise.all([
            totalSalesPromise,
            filteredSalesPromise,
            couponsUsedPromise,
            newUsersPromise,
            recentOrdersPromise
        ]);

        // --- 4. Formatar e Enviar Resposta ---
        res.json({
            totalSales: totalSalesResult[0]?.total || 0,
            filteredSales: filteredSalesResult[0]?.total || 0,
            couponsUsed: couponsUsed || 0,
            newUsers: newUsers || 0,
            recentOrders: recentOrders || []
        });
        
    } catch (error) {
        console.error("Erro ao carregar estatísticas do dashboard:", error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});


// --- (NOVAS) ROTAS DA API DE SAQUES (ADMIN) ---

// GET /api/admin/withdrawals - Pega TODOS os saques
app.get('/api/admin/withdrawals', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const affiliatesWithWithdrawals = await Affiliate.find({ 
            "withdrawals.0": { $exists: true } 
        }).populate('user', 'username');

        const allWithdrawals = [];
        affiliatesWithWithdrawals.forEach(affiliate => {
            affiliate.withdrawals.forEach(w => {
                allWithdrawals.push({
                    ...w.toObject(),
                    affiliate: {
                        _id: affiliate._id,
                        fullName: affiliate.fullName,
                        user: affiliate.user
                    }
                });
            });
        });
        
        allWithdrawals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        res.json(allWithdrawals);
    } catch (err) {
        console.error("Erro ao buscar saques:", err);
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/admin/withdrawals/:id/status - Atualiza o status de um saque
app.put('/api/admin/withdrawals/:id/status', isAuthenticated, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { status, reason } = req.body; // status: 'approved', 'completed', 'rejected'

    try {
        const affiliate = await Affiliate.findOne({ "withdrawals._id": id });
        if (!affiliate) {
            return res.status(404).json({ message: 'Solicitação de saque não encontrada.' });
        }
        
        const withdrawal = affiliate.withdrawals.id(id);
        if (!withdrawal) {
             return res.status(404).json({ message: 'Sub-documento de saque não encontrado.' });
        }
        
        const oldStatus = withdrawal.status;

        // 3. Lógica de atualização de status
        if (status === 'approved' && oldStatus === 'pending') {
            withdrawal.status = 'approved';
        } 
        else if (status === 'completed' && oldStatus === 'approved') {
            withdrawal.status = 'completed';
        } 
        else if (status === 'rejected' && (oldStatus === 'pending' || oldStatus === 'approved')) {
            if (!reason) {
                return res.status(400).json({ message: 'O motivo da recusa é obrigatório.' });
            }
            
            // Reembolsa o afiliado
            affiliate.balance += withdrawal.amount;
            // Remove o valor do 'total sacado' (pois foi cancelado)
            affiliate.totalWithdrawn -= withdrawal.amount; 
            
            withdrawal.status = 'rejected';
            withdrawal.rejectionReason = reason;
        } 
        else {
            return res.status(400).json({ message: `Não é possível mudar o status de '${oldStatus}' para '${status}'.` });
        }

        await affiliate.save();
        
        res.json({ message: `Saque atualizado para ${status}.`, affiliate });

    } catch (err) {
        console.error("Erro ao atualizar saque:", err);
        if (err.name === 'ValidationError') {
             return res.status(400).json({ message: `Erro de validação: ${err.message}` });
        }
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});


// --- (NOVAS) ROTAS DA API DO PAINEL DE AFILIADO ---

// GET /api/affiliate/dashboard - Pega as estatísticas
app.get('/api/affiliate/dashboard', isAuthenticated, isAffiliate, async (req, res) => {
    try {
        const affiliate = req.affiliate;
        await affiliate.populate('linkedCoupons');
        
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const salesLast30Days = await Order.countDocuments({
            commissionPaidTo: affiliate._id,
            createdAt: { $gte: thirtyDaysAgo }
        });
        
        const recentSales = await Order.find({ commissionPaidTo: affiliate._id })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('createdAt productTitle productPlan amount');

        res.json({
            balance: affiliate.balance,
            totalEarned: affiliate.totalEarned,
            totalWithdrawn: affiliate.totalWithdrawn,
            salesLast30Days: salesLast30Days,
            recentSales: recentSales,
            myCoupons: affiliate.linkedCoupons,
            commissionRate: affiliate.commissionRate
        });

    } catch (err) {
        console.error("Erro ao carregar dashboard do afiliado:", err);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

// GET /api/affiliate/withdrawals - Pega o histórico de saques
app.get('/api/affiliate/withdrawals', isAuthenticated, isAffiliate, async (req, res) => {
    try {
        res.json(req.affiliate.withdrawals);
    } catch (err) {
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

// POST /api/affiliate/request-withdrawal - Cria um pedido de saque
app.post('/api/affiliate/request-withdrawal', isAuthenticated, isAffiliate, async (req, res) => {
    try {
        const affiliate = req.affiliate;
        const minimumWithdrawal = 10000; // R$ 100,00 em centavos

        if (affiliate.balance < minimumWithdrawal) {
            return res.status(400).json({ message: 'Saldo insuficiente. O mínimo para saque é R$ 100,00.' });
        }
        
        const hasPending = affiliate.withdrawals.some(w => w.status === 'pending');
        if (hasPending) {
            return res.status(400).json({ message: 'Você já possui uma solicitação de saque pendente.' });
        }
        
        const withdrawalAmount = affiliate.balance; // Saca o saldo total
        
        const newWithdrawal = {
            amount: withdrawalAmount,
            status: 'pending',
            paymentDetailsSnapshot: affiliate.paymentDetails // Salva os dados PIX atuais
        };
        
        affiliate.withdrawals.push(newWithdrawal);
        affiliate.balance = 0; // Zera o saldo
        affiliate.totalWithdrawn += withdrawalAmount; // Adiciona ao total sacado
        
        await affiliate.save();
        
        res.status(201).json({ message: 'Solicitação de saque enviada com sucesso!' });

    } catch (err) {
        console.error("Erro ao solicitar saque:", err);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});


// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});