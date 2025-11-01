// --- CONFIGURAÇÃO DA TRADUÇÃO (i18n) ---
const flagImages = {
    "pt": "https://flagicons.lipis.dev/flags/4x3/br.svg",
    "en": "https://flagicons.lipis.dev/flags/4x3/us.svg"
};
const defaultLang = 'pt';

function translatePage() {
    const currentLang = localStorage.getItem('language') || defaultLang;

    const flagToggle = document.getElementById('language-toggle');
    if (flagToggle) {
        flagToggle.querySelector('img').src = flagImages[currentLang];
    }
    
    document.querySelectorAll('[data-key]').forEach(element => {
        const key = element.getAttribute('data-key');
        // Verifica se a chave existe na língua atual, senão, tenta a padrão (pt)
        const translation = (translations[currentLang] && translations[currentLang][key]) 
                          || (translations[defaultLang] && translations[defaultLang][key]); // Fallback para defaultLang
        
        if (translation !== undefined) {
            element.innerHTML = translation;
        }
    });

    document.querySelectorAll('[data-placeholder-key]').forEach(element => {
        const key = element.getAttribute('data-placeholder-key');
        const translation = (translations[currentLang] && translations[currentLang][key]) 
                          || (translations[defaultLang] && translations[defaultLang][key]); // Fallback para defaultLang
        if (translation !== undefined) {
            element.placeholder = translation;
        }
    });
}

function toggleLanguage() {
    let currentLang = localStorage.getItem('language') || defaultLang;
    currentLang = currentLang === 'pt' ? 'en' : 'pt';
    localStorage.setItem('language', currentLang);
    
    translatePage();
    updateNavStatus(); // (ATUALIZADO) Precisa recarregar o nav para traduzir o dropdown
    
    // Atualiza as mensagens de erro/sucesso se existirem
    updateAuthMessages();
}

// --- FUNÇÃO PARA VISUALIZAÇÃO DE SENHA ---
function initializePasswordToggles() {
    document.querySelectorAll('.password-toggle-icon').forEach(toggle => {
        // Previne múltiplos 'listeners' se a função for chamada mais de uma vez
        if (toggle.dataset.listenerAttached) return; 
        
        toggle.addEventListener('click', () => {
            const input = toggle.previousElementSibling; 
            
            if (input && (input.type === 'password' || input.type === 'text')) {
                if (input.type === 'password') {
                    input.type = 'text';
                    toggle.classList.remove('fa-eye');
                    toggle.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    toggle.classList.remove('fa-eye-slash');
                    toggle.classList.add('fa-eye');
                }
            }
        });
        toggle.dataset.listenerAttached = 'true';
    });
}

// --- (FUNÇÃO ATUALIZADA) STATUS DE LOGIN (com link de Afiliado) ---
async function updateNavStatus() {
    try {
        const response = await fetch('/api/auth/status');
        const data = await response.json();
        
        // (MODIFICADO) Seleciona os DOIS containers
        const authContainer = document.getElementById('nav-auth-container');
        const mobileAuthContainer = document.getElementById('mobile-nav-auth-container');
        
        if (!authContainer) return;

        const lang = localStorage.getItem('language') || defaultLang;
        
        // Limpa os dois
        authContainer.innerHTML = ''; 
        if (mobileAuthContainer) mobileAuthContainer.innerHTML = '';

        if (data.loggedIn) {
            const welcomeText = (translations[lang]['nav_welcome'] || translations[defaultLang]['nav_welcome']).replace('{username}', data.user.username);
            
            // Textos do Dropdown
            const myAccountText = translations[lang]['nav_account'] || "Minha Conta";
            const myOrdersText = translations[lang]['nav_orders'] || "Meus Pedidos";
            const logoutText = translations[lang]['nav_logout'] || "Logout";
            const affiliateText = "Painel Afiliado"; 

            let avatarHtml = '';
            if (data.user.avatar && data.user.discordId) {
                const avatarUrl = `https://cdn.discordapp.com/avatars/${data.user.discordId}/${data.user.avatar}.png`;
                avatarHtml = `<img src="${avatarUrl}" alt="Avatar" class="nav-user-avatar">`;
            } else {
                avatarHtml = `<div class="nav-user-avatar default-avatar"><i class="fas fa-user"></i></div>`;
            }
            
            let affiliateLink = '';
            if (data.isAffiliate) {
                affiliateLink = `
                <a href="/affiliate-dashboard.html" class="dropdown-item">
                    <i class="fas fa-hand-holding-usd"></i> ${affiliateText}
                </a>
                `;
            }
            
            // --- HTML do Dropdown (para Desktop e Mobile) ---
            // (OBS: O CSS cuida do posicionamento do dropdown em cada local)
            const userMenuHtml = `
                <div class="nav-user-menu">
                    ${avatarHtml}
                    <span>${welcomeText}</span>
                    <i class="fas fa-chevron-down dropdown-arrow"></i>

                    <div class="nav-user-dropdown">
                        <a href="/minha-conta" class="dropdown-item">
                            <i class="fas fa-user-circle"></i> ${myAccountText}
                        </a>
                        <a href="/meus-pedidos" class="dropdown-item">
                            <i class="fas fa-receipt"></i> ${myOrdersText}
                        </a>
                        ${affiliateLink} 
                        <a href="/logout" class="dropdown-item logout">
                            <i class="fas fa-sign-out-alt"></i> ${logoutText}
                        </a>
                    </div>
                </div>
            `;

            authContainer.innerHTML = userMenuHtml;
            if (mobileAuthContainer) mobileAuthContainer.innerHTML = userMenuHtml;
        
        } else {
            // Escondido por CSS na navbar 'compact'
            const loginText = translations[lang]['nav_login'] || translations[defaultLang]['nav_login'];
            const registerText = translations[lang]['nav_register'] || translations[defaultLang]['nav_register'];
            
            // --- HTML dos Botões (para Desktop) ---
            const authButtonsHtml = `
                <a href="/login" class="btn btn-primary">${loginText}</a> 
                <a href="/register" class="btn btn-secondary">${registerText}</a> 
            `;
            
            // (NOVO) Botões para Mobile (empilhados)
            const mobileAuthButtonsHtml = `
                <a href="/login" class="btn btn-primary">${loginText}</a> 
                <a href="/register" class="btn btn-secondary">${registerText}</a>
            `;
            
            authContainer.innerHTML = authButtonsHtml;
            if (mobileAuthContainer) mobileAuthContainer.innerHTML = mobileAuthButtonsHtml;
        }

        // Adiciona a bandeira (APENAS NO DESKTOP)
// --- (MODIFICADO) Adiciona a bandeira (Desktop e Mobile) ---
        
        // 1. Adiciona a bandeira no DESKTOP (com ID único)
        authContainer.innerHTML += `
            <button id="language-toggle-desktop" class="btn-flag">
                <img src="${flagImages[lang]}" alt="Mudar Idioma">
            </button>
        `;
        
        // 2. Adiciona a bandeira no MOBILE (dentro do menu, com ID único)
        if (mobileAuthContainer) {
            mobileAuthContainer.innerHTML += `
                <button id="language-toggle-mobile" class="btn-flag">
                    <img src="${flagImages[lang]}" alt="Mudar Idioma">
                </button>
            `;
        }
        
        // 3. (MODIFICADO) Adiciona listeners para AMBAS as bandeiras
        const langToggleDesktop = document.getElementById('language-toggle-desktop');
        if (langToggleDesktop) {
            langToggleDesktop.addEventListener('click', toggleLanguage);
        }
        const langToggleMobile = document.getElementById('language-toggle-mobile');
        if (langToggleMobile) {
            langToggleMobile.addEventListener('click', toggleLanguage);
        }
        
        // Re-inicializa os ícones de olho
        initializePasswordToggles();

    } catch (error) {
        console.error('Erro ao verificar status de login:', error);
    }
}


// --- FUNÇÃO PARA TRATAR ERROS/SUCESSO DE AUTH ---
function updateAuthMessages() {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    const success = params.get('success');
    const lang = localStorage.getItem('language') || defaultLang;

    const errorElement = document.getElementById('auth-error-msg');
    const successElement = document.getElementById('auth-success-msg');

    if (errorElement) {
        if (error) {
            // Tenta traduzir a mensagem de erro, se não conseguir, usa o texto literal
            const errorKey = decodeURIComponent(error);
            errorElement.textContent = (translations[lang] && translations[lang][errorKey]) 
                                     || (translations[defaultLang] && translations[defaultLang][errorKey]) 
                                     || errorKey; // Fallback para o texto do erro
            errorElement.style.display = 'block';
        } else {
            errorElement.style.display = 'none';
        }
    }
    
    if (successElement) {
        if (success) {
            // Usa a tradução para a mensagem de sucesso
            const successKey = decodeURIComponent(success);
            successElement.textContent = (translations[lang] && translations[lang][successKey]) 
                                       || (translations[defaultLang] && translations[defaultLang][successKey]) 
                                       || "Sucesso!"; // Fallback genérico
            successElement.style.display = 'block';
        } else {
            successElement.style.display = 'none';
        }
    }
}


// --- CÓDIGO DE INICIALIZAÇÃO DA PÁGINA ---
document.addEventListener('DOMContentLoaded', () => {

    // 0. Ativa os "olhinhos" de senha assim que o DOM carregar
    initializePasswordToggles();
    
    // 1. Atualiza a barra de navegação (Login/Logout/Avatar/Bandeira)
    updateNavStatus();
    
    // 2. Traduz todo o conteúdo estático da página
    translatePage();

    // 3. Mostra mensagens de erro/sucesso (das páginas de auth)
    updateAuthMessages();

    // 4. Código de Animação (Scroll)
    const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    elementsToAnimate.forEach(el => observer.observe(el));

    // ===========================================
    // === (NOVO) CÓDIGO DO MENU MOBILE ===
    // ===========================================
    const hamburgerToggle = document.getElementById('hamburger-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileNavClose = document.getElementById('mobile-nav-close');
    
    // Clona os links estáticos
    const desktopLinks = document.querySelector('.new-nav-links');
    const mobileLinksContainer = document.querySelector('.mobile-nav-links');
    
    if (desktopLinks && mobileLinksContainer) {
        mobileLinksContainer.innerHTML = desktopLinks.innerHTML;
    }

    // Abre o menu
    if (hamburgerToggle && mobileNav) {
        hamburgerToggle.addEventListener('click', () => {
            mobileNav.classList.add('is-open');
        });
    }

    // Fecha o menu
    if (mobileNavClose && mobileNav) {
        mobileNavClose.addEventListener('click', () => {
            mobileNav.classList.remove('is-open');
        });
    }
    // ===========================================
    // === FIM DO CÓDIGO DO MENU MOBILE ===
    // ===========================================
    
});