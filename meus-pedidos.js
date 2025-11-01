document.addEventListener('DOMContentLoaded', () => {

    const tableBody = document.getElementById('orders-table-body');
    const loading = document.getElementById('orders-loading');
    const empty = document.getElementById('orders-empty');

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    };

    const formatStatus = (status) => {
        if (status === 'paid') {
            return '<span class="status-badge status-paid">Pago</span>';
        }
        if (status === 'pending') {
            return '<span class="status-badge status-pending">Pendente</span>';
        }
        return '<span class="status-badge status-cancelled">Cancelado</span>';
    };

    const loadOrders = async () => {
        try {
            const response = await fetch('/api/account/orders');
            if (!response.ok) {
                if (response.status === 401) window.location.href = '/login';
                throw new Error('Falha ao carregar pedidos');
            }
            const orders = await response.json();

            loading.style.display = 'none';

            if (orders.length === 0) {
                empty.style.display = 'flex';
                return;
            }

            tableBody.innerHTML = ''; // Limpa
            orders.forEach(order => {
                const tr = document.createElement('tr');
                tr.className = 'order-row-clickable'; 
                tr.dataset.href = `/pedido-detalhes.html?id=${order._id}`; 
                
                tr.innerHTML = `
                    <td>${formatDate(order.createdAt)}</td>
                    <td>${order.productTitle}</td>
                    <td>${order.productPlan}</td>
                    <td>R$ ${(order.amount / 100).toFixed(2)}</td>
                    <td>${formatStatus(order.status)}</td>
                `;
                
                // Adiciona o listener de clique
                tr.addEventListener('click', () => {
                    window.location.href = tr.dataset.href;
                });

                tableBody.appendChild(tr);
            });

        } catch (error) {
            console.error(error);
            loading.innerHTML = 'Erro ao carregar pedidos.';
        }
    };

    loadOrders();
});