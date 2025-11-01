document.addEventListener('DOMContentLoaded', () => {
    // Elementos das Métricas
    const statTotalSales = document.getElementById('stat-total-sales');
    const statFilteredSales = document.getElementById('stat-filtered-sales');
    const statCouponsUsed = document.getElementById('stat-coupons-used');
    const statNewUsers = document.getElementById('stat-new-users');
    const recentOrdersBody = document.getElementById('recent-orders-body');
    
    // Elementos do Filtro
    const dateStartInput = document.getElementById('date-start');
    const dateEndInput = document.getElementById('date-end');
    const filterButton = document.querySelector('.filter-controls .btn-primary');

    // Helper para formatar moeda
    const formatCurrency = (valueInCents) => {
        return `R$ ${(valueInCents / 100).toFixed(2)}`;
    };

    // Helper para formatar status do pedido
    const formatStatus = (status) => {
        if (status === 'paid') {
            return '<span class="status-paid">Pago</span>';
        }
        if (status === 'pending') {
            return '<span class="status-pending">Pendente</span>';
        }
        if (status === 'cancelled') {
            return '<span class="status-rejected">Cancelado</span>'; // Reutilizando a classe de "rejeitado"
        }
        return status;
    };

    // Função principal para carregar os dados
    const loadDashboardStats = async (startDate = null, endDate = null) => {
        try {
            // Constrói a URL da API com os filtros de data
            let apiUrl = '/api/admin/dashboard-stats';
            if (startDate && endDate) {
                apiUrl += `?start=${startDate}&end=${endDate}`;
            }

            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error('Falha ao carregar dados do dashboard');
            }
            const data = await response.json();

            // 1. Atualiza os Cards de Métricas
            statTotalSales.textContent = formatCurrency(data.totalSales);
            statFilteredSales.textContent = formatCurrency(data.filteredSales);
            statCouponsUsed.textContent = data.couponsUsed;
            statNewUsers.textContent = data.newUsers;

            // 2. Atualiza a Tabela de Pedidos Recentes
            recentOrdersBody.innerHTML = ''; // Limpa a tabela
            if (data.recentOrders.length === 0) {
                recentOrdersBody.innerHTML = '<tr><td colspan="5">Nenhum pedido recente encontrado.</td></tr>';
                return;
            }
            
            data.recentOrders.forEach(order => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${order.orderNumber}</td>
                    <td>${order.user ? order.user.username : 'Usuário Deletado'}</td>
                    <td>${order.productTitle}</td>
                    <td>${formatStatus(order.status)}</td>
                    <td>${formatCurrency(order.amount)}</td>
                `;
                recentOrdersBody.appendChild(tr);
            });

        } catch (error) {
            console.error('Erro no Dashboard:', error);
            recentOrdersBody.innerHTML = `<tr><td colspan="5">Erro ao carregar pedidos.</td></tr>`;
        }
    };

    // --- Listeners ---
    
    // Listener do botão de filtrar
    filterButton.addEventListener('click', () => {
        const startDate = dateStartInput.value;
        const endDate = dateEndInput.value;

        if (startDate && endDate) {
            loadDashboardStats(startDate, endDate);
        } else {
            alert('Por favor, selecione uma data inicial e final.');
        }
    });

    // Carregamento inicial (sem filtro)
    loadDashboardStats();
});