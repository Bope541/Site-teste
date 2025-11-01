document.addEventListener('DOMContentLoaded', () => {
    const orderId = new URLSearchParams(window.location.search).get('id');
    
    const loadingEl = document.getElementById('loading');
    const contentEl = document.getElementById('order-content');
    const keyColumnEl = document.getElementById('key-column');
    
    // Elementos de Info
    const infoOrderNumber = document.getElementById('info-order-number');
    const infoDate = document.getElementById('info-date');
    const infoProduct = document.getElementById('info-product');
    const infoPlan = document.getElementById('info-plan');
    const infoValue = document.getElementById('info-value');
    const infoStatus = document.getElementById('info-status');
    const keyStringInput = document.getElementById('key-string');
    const copyKeyBtn = document.getElementById('copy-key-btn');

    if (!orderId) {
        loadingEl.innerHTML = 'ID do pedido não encontrado.';
        return;
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const formatStatus = (status) => {
        if (status === 'paid') return '<span class="status-badge status-paid">Pago</span>';
        if (status === 'pending') return '<span class="status-badge status-pending">Pendente</span>';
        return '<span class="status-badge status-cancelled">Cancelado</span>';
    };

    const loadOrderDetails = async () => {
        try {
            const response = await fetch(`/api/account/orders/${orderId}`);
            if (!response.ok) {
                if (response.status === 401) window.location.href = '/login';
                if (response.status === 403) throw new Error('Acesso negado');
                throw new Error('Falha ao carregar pedido');
            }
            const order = await response.json();

            // Preenche os detalhes
            infoOrderNumber.textContent = order.orderNumber;
            infoDate.textContent = formatDate(order.createdAt);
            infoProduct.textContent = order.productTitle;
            infoPlan.textContent = order.productPlan;
            infoValue.textContent = `R$ ${(order.amount / 100).toFixed(2)}`;
            infoStatus.innerHTML = formatStatus(order.status);

            // Se o pedido estiver pago E tiver uma chave, mostra a chave
            if (order.status === 'paid' && order.assignedKey) {
                if (order.assignedKey === 'SEM_ESTOQUE_CONTATAR_SUPORTE') {
                    keyStringInput.value = 'Erro no estoque, contate o suporte';
                    keyStringInput.style.color = '#ff6b6b';
                    copyKeyBtn.disabled = true;
                } else {
                    keyStringInput.value = order.assignedKey;
                }
                keyColumnEl.style.display = 'block';
            }

            // Mostra o conteúdo
            loadingEl.style.display = 'none';
            contentEl.style.display = 'block';

        } catch (error) {
            console.error(error);
            loadingEl.innerHTML = error.message;
        }
    };
    
    // Botão de Copiar Chave
    copyKeyBtn.addEventListener('click', () => {
        keyStringInput.select();
        navigator.clipboard.writeText(keyStringInput.value).then(() => {
            const btnText = copyKeyBtn.querySelector('span');
            btnText.textContent = 'Copiado!';
            setTimeout(() => { btnText.textContent = 'Copiar'; }, 2000);
        });
    });

    loadOrderDetails();
});