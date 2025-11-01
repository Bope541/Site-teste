const translations = {
  "pt": {
    // --- Navegação ---
    "nav_home": "Inicial",
    "nav_store": "Loja",
    "nav_faq": "FAQ",
    "nav_login": "Login",
    "nav_register": "Registrar",
    "nav_welcome": "Olá, {username}",
    "nav_logout": "Logout",
    
    // --- Login/Registro ---
    "login_title": "Bem-vindo de volta à <span class=\"highlight\">Invict</span>",
    "login_subtitle": "Digite suas informações para <a href=\"/login\">Logar</a>",
    "login_email_user": "EMAIL OU NOME DE USUÁRIO",
    "login_password": "SENHA",
    "login_forgot": "Esqueceu a senha?",
    "login_continue": "Continuar",
    "login_discord": "Logar com Discord",
    "register_title": "Bem-vindo à <span class=\"highlight\">Invict</span>",
    "register_subtitle": "Digite suas informações para <a href=\"/register\">Registrar</a>",
    "register_username": "NOME DE USUÁRIO",
    "register_email": "E-MAIL",
    "register_password": "SENHA",
    "register_continue": "Continuar",
    "register_discord": "Registrar com Discord",
    "form_or": "OU",
    "footer_start": "Começar",
    "footer_copy": "&copy; 2025 Invict. Todos os direitos reservados.",
    "login_no_account": "Não possui conta?",
    "login_register_now": "Cadastre-se agora",
    "register_already_account": "Ja tem uma conta?",
    "register_login_now": "Faça Login",

    // --- Reset de Senha (Etapas) ---
    "forgot_step1_title": "Redefinir sua senha",
    "forgot_step1_subtitle": "Digite seu e-mail e enviaremos um código de 6 dígitos.",
    "forgot_email_label": "E-MAIL DA CONTA",
    "forgot_btn_send_code": "Enviar Código",
    "forgot_step2_title": "Verifique seu E-mail",
    "forgot_step2_subtitle": "Enviamos um código de 6 dígitos para <strong>{email}</strong>.",
    "forgot_code_label": "CÓDIGO DE 6 DÍGITOS",
    "forgot_btn_verify": "Verificar Código",
    "forgot_step3_title": "Crie uma Nova Senha",
    "forgot_step3_subtitle": "Olá, <strong>{username}</strong>! Digite sua nova senha.",
    "forgot_new_pass_label": "NOVA SENHA",
    "forgot_confirm_pass_label": "CONFIRME A NOVA SENHA",
    "forgot_btn_save": "Salvar Nova Senha",
    "forgot_back_to_login": "Voltar para o Login",
    
    // --- Requisitos de Senha ---
    "register_req_title": "Sua senha deve conter:",
    "register_req_length": "Pelo menos 8 caracteres",
    "register_req_upper": "Pelo menos 1 letra maiúscula (A–Z)",
    "register_req_lower": "Pelo menos 1 letra minúscula (a–z)",
    "register_req_number": "Pelo menos 1 número (0–9)",
    "register_req_symbol": "Pelo menos 1 símbolo especial (ex: @, #, $, !)",

    // --- Mensagens de Status (do server.js) ---
    "login_success_pass_reset": "Senha redefinida com sucesso! Faça login.",
    "Código expirado ou inválido.": "Código expirado ou inválido.",
    "Código incorreto.": "Código incorreto.",
    "As senhas não coincidem.": "As senhas não coincidem.",
    "Sessão de redefinição inválida. Tente novamente.": "Sessão de redefinição inválida. Tente novamente.",
    "Sua senha não atende aos requisitos mínimos de segurança.": "Sua senha não atende aos requisitos mínimos de segurança.",
    "Sua senha não atende a todos os requisitos.": "Sua senha não atende a todos os requisitos.",

    // --- index.html ---
    "hero_tag": "Confiado por mais de 10K+ Gamers",
    "hero_title": "Domine Cada <span class=\"highlight\">Partida</span> com o Poder de Vencer",
    "hero_desc": "Explore a plataforma perfeita para elevar seu desempenho nos games. Rápida, segura e feita para gamers que buscam dominar cada partida.",
    "hero_btn_community": "Junte-se à Comunidade",
    "hero_btn_demo": "Ver Demonstração",
    "stats_users": "Usuários Ativos",
    "stats_uptime": "Tempo de Atividade",
    "stats_support": "Suporte",
    "features_title": "Nosso <span class=\"highlight\">Diferencial</span>",
    "features_subtitle": "Transformamos sua experiência nos games com ferramentas únicas e inovadoras,<br>pensadas para elevar seu desempenho e diversão a outro nível.",
    "f1_title": "Segurança de Ponta",
    "f1_desc": "Protocolos avançados de segurança para manter seus dados protegidos e suas sessões de jogo seguras.",
    "f2_title": "Suporte Especializado 24/7",
    "f2_desc": "Assistência permanente de nossos especialistas. Estamos aqui sempre que precisar de ajuda.",
    "f3_title": "Velocidade Relâmpago",
    "f3_desc": "Otimizado para desempenho com latência mínima. Entrega de keys e ativação de sistema instantâneas.",
    "f4_title": "Preços Justos",
    "f4_desc": "Valores competitivos com precificação transparente. Sem taxas ocultas, apenas valor real para gamers sérios.",
    "f5_title": "Indetectável & Privado",
    "f5_desc": "Tecnologia stealth avançada garante que sua experiência de jogo aprimorada permaneça privada e segura.",
    "f6_title": "Comunidade Ativa",
    "f6_desc": "Junte-se a milhares de gamers compartilhando estratégias, dicas e experiências em nossa vibrante comunidade no Discord.",

    // --- loja.html ---
    "store_title": "Nossa <span class=\"highlight\">Loja</span>",
    "store_subtitle": "Descubra nossa coleção de produtos feitos para elevar seu nível.",
    "store_info_delivery": "Entrega Automática",
    "store_info_support": "Suporte 24/7",
    "store_search": "Pesquisar produtos...",
    "store_categories": "Categorias",
    "cat_all": "Todas as Categorias",
    "cat_external": "FiveM External",
    "cat_bypass": "FiveM Bypass",
    "cat_ff": "Free Fire",
    "cat_spoofer": "FiveM Spoofer",
    "cat_others": "Others",
    "store_results": "produtos encontrados",
    "prod_badge": "Indetectável",
    "prod_platform": "Plataforma",
    "prod_delivery": "Entrega",
    "prod_delivery_auto": "Automática",
    
    // --- produto.html ---
    "prod_back": "Voltar aos produtos",
    "prod_buy": "Comprar Agora",
    "prod_preview": "Prévia",
    "prod_details_title": "Detalhes do Produto",
    "prod_details_platform": "Plataforma",
    "prod_details_type": "Tipo",
    "prod_details_warranty": "Garantia",

    // --- Checkout ---
    "checkout_billing": "Dados da Cobrança",
    "checkout_payment_method": "Método de Pagamento",
    "checkout_summary": "Resumo do pedido",
    "checkout_pix": "PIX",
    "checkout_card": "Cartão de Crédito",
    "checkout_paypal": "Paypal",
    "checkout_stripe": "Stripe",
    "checkout_in_development": "Em Desenvolvimento",
    "checkout_full_name": "NOME COMPLETO *",
    "checkout_cpf": "CPF *",
    "checkout_email": "E-MAIL *",
    "checkout_terms_1": "Aceito os",
    "checkout_terms_2": "termos de serviço",
    "checkout_terms_3": "e",
    "checkout_terms_4": "política de privacidade",
    "checkout_terms_5": ". Confirmo que os dados informados são verdadeiros.",
    "checkout_subtotal": "Subtotal:",
    "checkout_total": "Total:",
    "checkout_submit": "Finalizar Pagamento",
    "checkout_secure_note": "Compra 100% segura e protegida",

    // --- Minha Conta / Meus Pedidos ---
    "nav_account": "Minha Conta",
    "nav_orders": "Meus Pedidos",
    "account_title": "Minha Conta",
    "account_info_title": "Informações da Conta",
    "account_username": "Nome de Usuário",
    "account_email": "Email",
    "account_member_since": "Membro desde",
    "account_redeem_title": "Resgatar Chave",
    "account_redeem_subtitle": "Cole a chave do produto que você comprou para ativá-lo em sua conta.",
    "account_redeem_btn": "Resgatar",
    "account_subs_title": "Minhas Assinaturas",
    "account_subs_loading": "Carregando assinaturas...",
    "account_subs_empty": "Você não possui assinaturas ativas.",
    "orders_title": "Meus Pedidos",
    "orders_date": "Data",
    "orders_product": "Produto",
    "orders_plan": "Plano",
    "orders_value": "Valor",
    "orders_status": "Status",
    "orders_loading": "Carregando pedidos...",
    "orders_empty": "Você não fez nenhum pedido.",
    "orders_back": "Voltar para Pedidos",
    "order_details_title": "Detalhes do Pedido",
    "order_key_title": "Sua Chave de Ativação",
    "order_key_subtitle": "A sua chave foi entregue automaticamente após a confirmação do pagamento.",
    "order_key_copy": "Copiar",
    "order_summary": "Resumo do Pedido",
    "order_number": "NÚMERO DO PEDIDO",
    
    // --- (ADICIONADO) FAQ & Termos ---
    "faq_title": "Termos & Perguntas Frequentes",
    "faq_subtitle": "Tire suas dúvidas e conheça nossas políticas de serviço.",
    "faq_t1_title": "Termos de serviços da INVICT",
    "faq_t1_content": `
        <ol>
            <li>Para utilizar nossos serviços, você deve obrigatoriamente concordar com nossos termos, independentemente do serviço contratado.</li>
            <li>Todas as compras realizadas na INVICT referem-se exclusivamente a <strong>produtos virtuais</strong>, não contemplando entregas físicas ou envio de qualquer item material.</li>
            <li>Ao utilizar nossos serviços, você concorda com nossos Termos e Políticas de Uso, podendo ser impedido de continuar utilizando-os em caso de descumprimento.</li>
            <li>O descumprimento de qualquer uma das cláusulas destes termos poderá resultar em <strong>suspensão, bloqueio ou banimento definitivo</strong> do acesso aos serviços.</li>
            <li>A INVICT reserva-se o direito de <strong>alterar, suspender ou encerrar</strong> qualquer produto, serviço ou funcionalidade sem aviso prévio.</li>
            <li>Qualquer tentativa de <strong>burlar sistemas de segurança, modificar produtos ou redistribuir nossos softwares</strong> resultará em banimento imediato e possível ação legal.</li>
        </ol>
    `,
    "faq_t2_title": "Política de reembolso e informações complementares",
    "faq_t2_content": `
        <ol>
            <li>O reembolso de valores monetários e serviços contratados poderá ser solicitado apenas nas seguintes condições:
                <ul>
                    <li>Caso o valor tenha sido debitado e o produto <strong>não tenha sido entregue corretamente</strong>.</li>
                    <li>Em caso de falha comprovada no software que impeça o uso <strong>para todos os clientes simultaneamente</strong>.</li>
                    <li>Solicitações de reembolso por mau uso, problemas individuais, incompatibilidade de hardware ou insatisfação pessoal <strong>serão negadas</strong>.</li>
                    <li>Reembolsos <strong>não serão realizados</strong> após ativação, utilização ou download do produto.</li>
                </ul>
            </li>
            <li>O prazo para análise de reembolsos, quando aplicável, é de até <strong>7 dias úteis</strong>, contados a partir da solicitação.</li>
            <li>O reembolso será feito exclusivamente <strong>pelo mesmo método de pagamento</strong> utilizado na compra.</li>
            <li>Tentativas de estorno indevido (chargeback) resultarão em <strong>bloqueio imediato do acesso aos serviços</strong> e <strong>inclusão em lista de fraude</strong>.</li>
        </ol>
    `,
    "faq_t3_title": "Responsabilidade da INVICT com você",
    "faq_t3_content": `
        <ol>
            <li>A INVICT reserva-se o direito de preservar suas informações e dados de uso, a partir do momento em que houver utilização dos nossos serviços.</li>
            <li>A equipe da INVICT <strong>não se responsabiliza</strong> por qualquer tipo de dano, banimento, detecção, perda de conta, prejuízo financeiro, falhas externas ou atualizações de terceiros.</li>
            <li>Reiterando o termo anterior, a INVICT <strong>não assume responsabilidade</strong> por falhas, modificações indevidas, incompatibilidade de sistemas ou consequências resultantes do uso dos produtos.</li>
            <li>O uso de qualquer software fornecido pela INVICT é de <strong>inteira responsabilidade do cliente</strong>, que reconhece estar ciente dos riscos envolvidos.</li>
            <li>O compartilhamento de contas, chaves de ativação, ou qualquer tentativa de revenda <strong>é estritamente proibido</strong> e resultará em suspensão permanente.</li>
            <li>A INVICT reserva-se o direito de efetuar <strong>manutenções e atualizações periódicas</strong>, podendo causar indisponibilidade temporária dos serviços sem aviso prévio.</li>
        </ol>
    `,
    "faq_t4_title": "Licenciamento e propriedade intelectual",
    "faq_t4_content": `
        <ol>
            <li>Todos os produtos, marcas, nomes e conteúdos disponibilizados pela INVICT são <strong>propriedade exclusiva da empresa</strong>.</li>
            <li>É proibida a <strong>redistribuição, revenda, cópia, engenharia reversa ou modificação</strong> de qualquer produto sem autorização expressa da INVICT.</li>
            <li>O uso indevido de propriedade intelectual poderá resultar em <strong>medidas legais e penalidades civis</strong>.</li>
        </ol>
    `,
    "faq_t5_title": "Privacidade e segurança de dados",
    "faq_t5_content": `
        <ol>
            <li>A INVICT coleta apenas informações essenciais para o funcionamento de suas plataformas e autenticação dos usuários.</li>
            <li>Nenhum dado pessoal é compartilhado com terceiros, salvo em casos exigidos por lei.</li>
            <li>O cliente é responsável por <strong>manter suas credenciais de acesso em segurança</strong> e não compartilhá-las com outras pessoas.</li>
            <li>Em caso de suspeita de vazamento ou acesso indevido, o cliente deve <strong>alterar imediatamente sua senha e notificar o suporte</strong>.</li>
            <li>A INVICT utiliza <strong>protocolos criptográficos e sistemas internos de segurança</strong> para proteger os dados armazenados.</li>
        </ol>
    `,
    "faq_t6_title": "Suporte e comunicação",
    "faq_t6_content": `
        <ol>
            <li>O suporte oficial da INVICT é realizado exclusivamente pelos <strong>canais oficiais</strong> informados no site.</li>
            <li>O tempo de resposta pode variar conforme a demanda, sendo priorizadas solicitações técnicas e dúvidas sobre funcionamento.</li>
            <li>Nenhum membro da equipe pedirá senhas, chaves de ativação ou dados bancários diretamente.</li>
            <li>A INVICT reserva-se o direito de <strong>encerrar atendimentos que apresentem conduta desrespeitosa ou linguagem inadequada</strong>.</li>
        </ol>
    `,
    "faq_t7_title": "Disposições gerais",
    "faq_t7_content": `
        <ol>
            <li>Ao utilizar os serviços da INVICT, o cliente declara estar ciente e de acordo com todos os termos descritos neste documento.</li>
            <li>Estes termos poderão ser atualizados sem aviso prévio, sendo responsabilidade do cliente <strong>verificar periodicamente as alterações</strong>.</li>
            <li>Qualquer controvérsia será resolvida conforme a legislação vigente, sob foro da comarca definida pela administração da INVICT.</li>
            <li>O uso contínuo dos produtos e serviços após atualizações nos termos implica <strong>aceitação automática das novas condições</strong>.</li>
        </ol>
    `
  },
  "en": {
    // --- Navigation ---
    "nav_home": "Home",
    "nav_store": "Store",
    "nav_faq": "FAQ",
    "nav_login": "Login",
    "nav_register": "Register",
    "nav_welcome": "Hello, {username}",
    "nav_logout": "Logout",
    
    // --- Login/Register ---
    "login_title": "Welcome back to <span class=\"highlight\">Invict</span>",
    "login_subtitle": "Enter your information to <a href=\"/login\">Log in</a>",
    "login_email_user": "EMAIL OR USERNAME",
    "login_password": "PASSWORD",
    "login_forgot": "Forgot password?",
    "login_continue": "Continue",
    "login_discord": "Login with Discord",
    "register_title": "Welcome to <span class=\"highlight\">Invict</span>",
    "register_subtitle": "Enter your information to <a href=\"/register\">Register</a>",
    "register_username": "USERNAME",
    "register_email": "E-MAIL",
    "register_password": "PASSWORD",
    "register_continue": "Continue",
    "register_discord": "Register with Discord",
    "form_or": "OR",
    "footer_start": "Get Started",
    "footer_copy": "&copy; 2025 Invict. All rights reserved.",
    "login_no_account": "Don't have an account?",
    "login_register_now": "Sign up now",
    "register_already_account": "Already have an account?",
    "register_login_now": "Log In",

    // --- Password Reset (NEW STEPS) ---
    "forgot_step1_title": "Reset your password",
    "forgot_step1_subtitle": "Enter your email and we'll send you a 6-digit code.",
    "forgot_email_label": "ACCOUNT EMAIL",
    "forgot_btn_send_code": "Send Code",
    "forgot_step2_title": "Check your E-mail",
    "forgot_step2_subtitle": "We sent a 6-digit code to <strong>{email}</strong>.",
    "forgot_code_label": "6-DIGIT CODE",
    "forgot_btn_verify": "Verify Code",
    "forgot_step3_title": "Create a New Password",
    "forgot_step3_subtitle": "Hello, <strong>{username}</strong>! Enter your new password.",
    "forgot_new_pass_label": "NEW PASSWORD",
    "forgot_confirm_pass_label": "CONFIRM NEW PASSWORD",
    "forgot_btn_save": "Save New Password",
    "forgot_back_to_login": "Back to Login",

    // --- Password Requirements ---
    "register_req_title": "Your password must contain:",
    "register_req_length": "At least 8 characters",
    "register_req_upper": "At least 1 uppercase letter (A-Z)",
    "register_req_lower": "At least 1 lowercase letter (a-z)",
    "register_req_number": "At least 1 number (0-9)",
    "register_req_symbol": "At least 1 special symbol (e.g., @, #, $, !)",

    // --- Status Messages (from server.js) ---
    "login_success_pass_reset": "Password reset successfully! Please log in.",
    "Código expirado ou inválido.": "Code expired or invalid.",
    "Código incorreto.": "Incorrect code.",
    "As senhas não coincidem.": "Passwords do not match.",
    "Sessão de redefinição inválida. Tente novamente.": "Invalid reset session. Please try again.",
    "Sua senha não atende aos requisitos mínimos de segurança.": "Your password does not meet the minimum security requirements.",
    "Sua senha não atende a todos os requisitos.": "Your password does not meet all requirements.",

    // --- index.html ---
    "hero_tag": "Trusted by 10K+ Gamers",
    "hero_title": "Master Every <span class=\"highlight\">Match</span> with the Power to Win",
    "hero_desc": "Explore the perfect platform to elevate your gaming performance. Fast, secure, and made for gamers who aim to dominate every match.",
    "hero_btn_community": "Join the Community",
    "hero_btn_demo": "Watch Demo",
    "stats_users": "Active Users",
    "stats_uptime": "Uptime",
    "stats_support": "Support",
    "features_title": "Our <span class=\"highlight\">Difference</span>",
    "features_subtitle": "We transform your gaming experience with unique and innovative tools,<br>designed to take your performance and fun to another level.",
    "f1_title": "Top-Tier Security",
    "f1_desc": "Advanced security protocols to keep your data protected and your gaming sessions secure.",
    "f2_title": "24/7 Expert Support",
    "f2_desc": "Permanent assistance from our specialists. We are here whenever you need help.",
    "f3_title": "Lightning Speed",
    "f3_desc": "Optimized for performance with minimal latency. Instant key delivery and system activation.",
    "f4_title": "Fair Prices",
    "f4_desc": "Competitive values with transparent pricing. No hidden fees, just real value for serious gamers.",
    "f5_title": "Undetectable & Private",
    "f5_desc": "Advanced stealth technology ensures your enhanced gaming experience remains private and secure.",
    "f6_title": "Active Community",
    "f6_desc": "Join thousands of gamers sharing strategies, tips, and experiences in our vibrant Discord community.",

    // --- loja.html ---
    "store_title": "Our <span class=\"highlight\">Store</span>",
    "store_subtitle": "Discover our collection of products designed to level up your game.",
    "store_info_delivery": "Automatic Delivery",
    "store_info_support": "24/7 Support",
    "store_search": "Search products...",
    "store_categories": "Categories",
    "cat_all": "All Categories",
    "cat_external": "FiveM External",
    "cat_bypass": "FiveM Bypass",
    "cat_ff": "Free Fire",
    "cat_spoofer": "FiveM Spoofer",
    "cat_others": "Others",
    "store_results": "products found",
    "prod_badge": "Undetectable",
    "prod_platform": "Platform",
    "prod_delivery": "Delivery",
    "prod_delivery_auto": "Automatic",

    // --- produto.html ---
    "prod_back": "Back to products",
    "prod_buy": "Buy Now",
    "prod_preview": "Preview",
    "prod_details_title": "Product Details",
    "prod_details_platform": "Platform",
    "prod_details_type": "Type",
    "prod_details_warranty": "Warranty",

    // --- Checkout ---
    "checkout_billing": "Billing Details",
    "checkout_payment_method": "Payment Method",
    "checkout_summary": "Order Summary",
    "checkout_pix": "PIX",
    "checkout_card": "Credit Card",
    "checkout_paypal": "Paypal",
    "checkout_stripe": "Stripe",
    "checkout_in_development": "In Development",
    "checkout_full_name": "FULL NAME *",
    "checkout_cpf": "CPF *",
    "checkout_email": "E-MAIL *",
    "checkout_terms_1": "I accept the",
    "checkout_terms_2": "terms of service",
    "checkout_terms_3": "and",
    "checkout_terms_4": "privacy policy",
    "checkout_terms_5": ". I confirm the provided data is true.",
    "checkout_subtotal": "Subtotal:",
    "checkout_total": "Total:",
    "checkout_submit": "Complete Payment",
    "checkout_secure_note": "100% secure and protected purchase",

    // --- My Account / My Orders ---
    "nav_account": "My Account",
    "nav_orders": "My Orders",
    "account_title": "My Account",
    "account_info_title": "Account Information",
    "account_username": "Username",
    "account_email": "Email",
    "account_member_since": "Member since",
    "account_redeem_title": "Redeem Key",
    "account_redeem_subtitle": "Paste your purchased product key to activate it on your account.",
    "account_redeem_btn": "Redeem",
    "account_subs_title": "My Subscriptions",
    "account_subs_loading": "Loading subscriptions...",
    "account_subs_empty": "You have no active subscriptions.",
    "orders_title": "My Orders",
    "orders_date": "Date",
    "orders_product": "Product",
    "orders_plan": "Plan",
    "orders_value": "Value",
    "orders_status": "Status",
    "orders_loading": "Loading orders...",
    "orders_empty": "You have not placed any orders.",
    "orders_back": "Back to Orders",
    "order_details_title": "Order Details",
    "order_key_title": "Your Activation Key",
    "order_key_subtitle": "Your key was delivered automatically after payment confirmation.",
    "order_key_copy": "Copy",
    "order_summary": "Order Summary",
    "order_number": "ORDER NUMBER",

    // --- (ADICIONADO) FAQ & Terms ---
    "faq_title": "Terms & Frequently Asked Questions",
    "faq_subtitle": "Clear your doubts and learn about our service policies.",
    "faq_t1_title": "INVICT Terms of Service",
    "faq_t1_content": `
        <ol>
            <li>To use our services, you must agree to our terms, regardless of the service contracted.</li>
            <li>All purchases made at INVICT refer exclusively to <strong>virtual products</strong>, not including physical deliveries or the shipment of any material item.</li>
            <li>By using our services, you agree to our Terms and Policies of Use, and may be prevented from continuing to use them in case of non-compliance.</li>
            <li>Failure to comply with any of the clauses of these terms may result in <strong>suspension, blockage, or permanent ban</strong> from accessing the services.</li>
            <li>INVICT reserves the right to <strong>change, suspend, or terminate</strong> any product, service, or functionality without prior notice.</li>
            <li>Any attempt to <strong>bypass security systems, modify products, or redistribute our software</strong> will result in an immediate ban and possible legal action.</li>
        </ol>
    `,
    "faq_t2_title": "Refund policy and additional information",
    "faq_t2_content": `
        <ol>
            <li>A refund of monetary values and contracted services may be requested only under the following conditions:
                <ul>
                    <li>If the amount was debited and the product was <strong>not delivered correctly</strong>.</li>
                    <li>In case of a proven software failure that prevents use <strong>for all customers simultaneously</strong>.</li>
                    <li>Refund requests due to misuse, individual problems, hardware incompatibility, or personal dissatisfaction <strong>will be denied</strong>.</li>
                    <li>Refunds <strong>will not be issued</strong> after activation, use, or download of the product.</li>
                </ul>
            </li>
            <li>The deadline for refund analysis, when applicable, is up to <strong>7 business days</strong> from the request.</li>
            <li>The refund will be made exclusively <strong>by the same payment method</strong> used for the purchase.</li>
            <li>Improper chargeback attempts will result in an <strong>immediate block of access to services</strong> and <strong>inclusion on a fraud list</strong>.</li>
        </ol>
    `,
    "faq_t3_title": "INVICT's responsibility to you",
    "faq_t3_content": `
        <ol>
            <li>INVICT reserves the right to preserve your information and usage data from the moment you use our services.</li>
            <li>The INVICT team <strong>is not responsible</strong> for any type of damage, ban, detection, account loss, financial loss, external failures, or third-party updates.</li>
            <li>Reiterating the previous term, INVICT <strong>assumes no responsibility</strong> for failures, improper modifications, system incompatibility, or consequences resulting from the use of the products.</li>
            <li>The use of any software provided by INVICT is the <strong>entire responsibility of the customer</strong>, who acknowledges awareness of the risks involved.</li>
            <li>Sharing accounts, activation keys, or any resale attempt <strong>is strictly prohibited</strong> and will result in permanent suspension.</li>
            <li>INVICT reserves the right to perform <strong>periodic maintenance and updates</strong>, which may cause temporary service unavailability without prior notice.</li>
        </ol>
    `,
    "faq_t4_title": "Licensing and intellectual property",
    "faq_t4_content": `
        <ol>
            <li>All products, brands, names, and content provided by INVICT are the <strong>exclusive property of the company</strong>.</li>
            <li>The <strong>redistribution, resale, copying, reverse engineering, or modification</strong> of any product without the express authorization of INVICT is prohibited.</li>
            <li>The improper use of intellectual property may result in <strong>legal measures and civil penalties</strong>.</li>
        </ol>
    `,
    "faq_t5_title": "Privacy and data security",
    "faq_t5_content": `
        <ol>
            <li>INVICT collects only essential information for the operation of its platforms and user authentication.</li>
            <li>No personal data is shared with third parties, except in cases required by law.</li>
            <li>The customer is responsible for <strong>keeping their access credentials secure</strong> and not sharing them with others.</li>
            <li>In case of suspected leak or unauthorized access, the customer must <strong>immediately change their password and notify support</strong>.</li>
            <li>INVICT uses <strong>cryptographic protocols and internal security systems</strong> to protect stored data.</li>
        </ol>
    `,
    "faq_t6_title": "Support and communication",
    "faq_t6_content": `
        <ol>
            <li>Official INVICT support is provided exclusively through the <strong>official channels</strong> informed on the website.</li>
            <li>Response time may vary according to demand, prioritizing technical requests and operational questions.</li>
            <li>No team member will ask for passwords, activation keys, or banking data directly.</li>
            <li>INVICT reserves the right to <strong>terminate support interactions that show disrespectful conduct or inappropriate language</strong>.</li>
        </ol>
    `,
    "faq_t7_title": "General provisions",
    "faq_t7_content": `
        <ol>
            <li>By using INVICT's services, the customer declares to be aware of and in agreement with all terms described in this document.</li>
            <li>These terms may be updated without prior notice, and it is the customer's responsibility to <strong>periodically check for changes</strong>.</li>
            <li>Any dispute will be resolved according to current legislation, under the jurisdiction of the district defined by INVICT's administration.</li>
            <li>Continued use of products and services after updates to the terms implies <strong>automatic acceptance of the new conditions</strong>.</li>
        </ol>
    `
  }
};