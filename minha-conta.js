document.addEventListener('DOMContentLoaded', () => {

    // --- Elementos de Informação ---
    const infoUsername = document.getElementById('info-username');
    const infoEmail = document.getElementById('info-email');
    const infoCreatedAt = document.getElementById('info-created-at');

    // --- Elementos de Resgate ---
    const redeemForm = document.getElementById('redeem-form');
    const keyInput = document.getElementById('key-input');
    const redeemButton = document.getElementById('redeem-button');
    const redeemMessage = document.getElementById('redeem-message');

    // --- Elementos de Assinatura ---
    const subscriptionsList = document.getElementById('subscriptions-list');
    const subsLoading = document.getElementById('subs-loading');
    const subsEmpty = document.getElementById('subs-empty');
    
    // Array para guardar os intervalos dos timers e poder pará-los
    const activeTimers = [];

    // --- Função: Formatar Data (Helper) ---
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };
    
    // --- Função: Iniciar Cronômetro (Helper) ---
    const startCountdown = (countdownElement, expiresAt) => {
        const targetDate = new Date(expiresAt).getTime();
        
        const updateTimer = () => {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance < 0) {
                countdownElement.textContent = "Expirado";
                countdownElement.classList.add('expirado');
                return null; // Retorna null para parar o intervalo
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            countdownElement.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
            return true; // Continua o intervalo
        };

        // Atualiza imediatamente
        if (updateTimer()) {
            // E depois atualiza a cada segundo
            const intervalId = setInterval(() => {
                if (!updateTimer()) {
                    clearInterval(intervalId); // Para o timer
                }
            }, 1000);
            activeTimers.push(intervalId); // Salva o ID para limpar depois
        }
    };

    // --- Função: Criar Card de Assinatura (Helper) ---
    const createSubscriptionCard = (sub) => {
        const card = document.createElement('div');
        card.className = 'subscription-card';
        
        const isVitalicio = !sub.expiresAt || (new Date(sub.expiresAt).getFullYear() > new Date().getFullYear() + 50);
        
        card.innerHTML = `
            <div class="sub-header">
                <span class="sub-title">${sub.productName}</span>
                <span class="sub-plan ${isVitalicio ? 'vitalicio' : ''}">
                    ${isVitalicio ? 'Vitalício' : sub.planName}
                </span>
            </div>
            <div class="sub-timer">
                <div class="timer-label">Expira em:</div>
                <div class="timer-countdown" id="timer-${sub.keyUsed}">
                    ${isVitalicio ? 'Nunca' : 'Calculando...'}
                </div>
            </div>
        `;
        
        subscriptionsList.appendChild(card);
        
        // Inicia o cronômetro se não for vitalício
        if (!isVitalicio) {
            const countdownElement = document.getElementById(`timer-${sub.keyUsed}`);
            startCountdown(countdownElement, sub.expiresAt);
        }
    };
    
    // --- Função: Carregar Dados da Conta ---
    const loadAccountInfo = async () => {
        try {
            const response = await fetch('/api/account/info');
            if (!response.ok) {
                if (response.status === 401) window.location.href = '/login';
                throw new Error('Falha ao carregar dados da conta');
            }
            const user = await response.json();

            // 1. Preenche as informações
            infoUsername.textContent = user.username;
            infoEmail.textContent = user.email;
            infoCreatedAt.textContent = formatDate(user.createdAt);

            // 2. Limpa timers antigos e a lista
            activeTimers.forEach(clearInterval);
            subscriptionsList.innerHTML = '';
            
            // 3. Preenche as assinaturas
            if (user.activeSubscriptions && user.activeSubscriptions.length > 0) {
                subsLoading.style.display = 'none';
                subsEmpty.style.display = 'none';
                user.activeSubscriptions.forEach(createSubscriptionCard);
            } else {
                subsLoading.style.display = 'none';
                subsEmpty.style.display = 'flex';
            }

        } catch (error) {
            console.error(error);
            // alert(error.message); // Comentado para não ser chato
        }
    };

    // --- Função: Resgatar Chave (Form Submit) ---
    redeemForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const keyString = keyInput.value.trim();
        if (!keyString) return;

        // Feedback visual
        redeemButton.disabled = true;
        redeemButton.querySelector('.btn-text').style.display = 'none';
        redeemButton.querySelector('.loader').style.display = 'block';
        redeemMessage.textContent = '';
        redeemMessage.className = 'redeem-message';
        
        try {
            const response = await fetch('/api/account/redeem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keyString })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro desconhecido');
            }

            // Sucesso!
            redeemMessage.textContent = data.message;
            redeemMessage.classList.add('success');
            keyInput.value = ''; // Limpa o input
            
            // Adiciona o novo card dinamicamente
            subsEmpty.style.display = 'none';
            createSubscriptionCard(data.subscription);

        } catch (error) {
            redeemMessage.textContent = error.message;
            redeemMessage.classList.add('error');
        } finally {
            // Restaura o botão
            redeemButton.disabled = false;
            redeemButton.querySelector('.btn-text').style.display = 'block';
            redeemButton.querySelector('.loader').style.display = 'none';
        }
    });

    // --- Carregamento Inicial ---
    loadAccountInfo();
});