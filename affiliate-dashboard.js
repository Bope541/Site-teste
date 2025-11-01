document.addEventListener('DOMContentLoaded', () => {
    
    // --- Elementos das Abas ---
    const sidebarLinks = document.querySelectorAll('.affiliate-sidebar .nav-item');
    const tabContents = document.querySelectorAll('.affiliate-tab-content');

    // --- Elementos da Visão Geral ---
    const statBalance = document.getElementById('stat-balance');
    const statTotalEarned = document.getElementById('stat-total-earned');
    const statTotalWithdrawn = document.getElementById('stat-total-withdrawn');
    const statSales30d = document.getElementById('stat-sales-30d');
    const withdrawalBalance = document.getElementById('withdrawal-balance');
    const btnRequestWithdrawal = document.getElementById('btn-request-withdrawal');
    const recentSalesTable = document.getElementById('recent-sales-table');
    
    // --- Elementos dos Saques ---
    const withdrawalsTableBody = document.getElementById('withdrawals-table-body');
    
    // --- Elementos dos Cupons ---
    const couponsTableBody = document.getElementById('coupons-table-body');

    // --- Elementos do Modal ---
    const modal = document.getElementById('withdrawal-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const btnCancelModal = document.getElementById('btn-cancel-modal');
    const modalAmount = document.getElementById('modal-withdrawal-amount');
    const termsCheckbox = document.getElementById('terms-withdrawal');
    const btnConfirmWithdrawal = document.getElementById('btn-confirm-withdrawal');
    
    let currentBalance = 0; // Salva o saldo em centavos

    // --- Lógica de Animação de Scroll ---
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


    // --- Lógica das Abas ---
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = link.dataset.tab;

            // Remove 'active' de todos
            sidebarLinks.forEach(l => l.classList.remove('active'));
            tabContents.forEach(t => t.classList.remove('active'));

            // Adiciona 'active' ao clicado
            link.classList.add('active');
            document.getElementById(`tab-${tabId}`).classList.add('active');
            
            // Carrega os dados da aba (se necessário)
            if (tabId === 'withdrawals') loadWithdrawals();
            if (tabId === 'coupons') loadCoupons();
        });
    });

    // --- Carregar Dados da Visão Geral ---
    async function loadDashboardStats() {
        try {
            const res = await fetch('/api/affiliate/dashboard');
            if (!res.ok) throw new Error('Falha ao carregar dados');
            const data = await res.json();
            
            currentBalance = data.balance; // Salva em centavos
            const balanceInReais = (data.balance / 100).toFixed(2);
            
            statBalance.textContent = `R$ ${balanceInReais}`;
            statTotalEarned.textContent = `R$ ${(data.totalEarned / 100).toFixed(2)}`;
            statTotalWithdrawn.textContent = `R$ ${(data.totalWithdrawn / 100).toFixed(2)}`;
            statSales30d.textContent = data.salesLast30Days;
            
            withdrawalBalance.textContent = `R$ ${balanceInReais}`;
            
            // Habilita o botão de saque se o saldo for >= 100
            if (currentBalance >= 10000) { // R$100.00
                btnRequestWithdrawal.disabled = false;
            }

            // Popula tabela de vendas recentes
            recentSalesTable.innerHTML = '';
            if (data.recentSales.length === 0) {
                 recentSalesTable.innerHTML = '<tr><td colspan="4">Nenhuma venda recente.</td></tr>';
            }
            data.recentSales.forEach(sale => {
                const tr = document.createElement('tr');
                const commission = (sale.amount * (data.commissionRate / 100)).toFixed(2);
                tr.innerHTML = `
                    <td>${new Date(sale.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td>${sale.productTitle} (${sale.productPlan})</td>
                    <td>R$ ${(sale.amount / 100).toFixed(2)}</td>
                    <td class="status-paid">+ R$ ${commission}</td>
                `;
                recentSalesTable.appendChild(tr);
            });

        } catch (error) {
            console.error(error);
            statBalance.textContent = 'Erro';
        }
    }

    // --- Carregar Histórico de Saques ---
// --- Carregar Histórico de Saques ---
    async function loadWithdrawals() {
        try {
            const res = await fetch('/api/affiliate/withdrawals');
            if (!res.ok) throw new Error('Falha ao carregar saques');
            const withdrawals = await res.json();
            
            withdrawalsTableBody.innerHTML = '';
            if (withdrawals.length === 0) {
                withdrawalsTableBody.innerHTML = '<tr><td colspan="5">Nenhum saque solicitado.</td></tr>';
            }
            
            withdrawals.reverse().forEach(w => {
                const tr = document.createElement('tr');
                let statusClass = '', statusText = '';

                switch(w.status) {
                    case 'pending':
                        statusClass = 'status-pending';
                        statusText = 'Pendente';
                        break;
                    case 'approved': // (NOVO)
                        statusClass = 'status-approved';
                        statusText = 'Aprovado (Aguardando Pagamento)';
                        break;
                    case 'completed': // (NOVO)
                        statusClass = 'status-completed';
                        statusText = 'Pago';
                        break;
                    case 'rejected':
                        statusClass = 'status-rejected';
                        statusText = 'Recusado';
                        break;
                }

                tr.innerHTML = `
                    <td>${new Date(w.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td>R$ ${(w.amount / 100).toFixed(2)}</td>
                    <td><span class="${statusClass}">${statusText}</span></td>
                    <td>${w.paymentDetailsSnapshot.pixKeyType}</td>
                    <td>${w.rejectionReason || '--'}</td>
                `;
                withdrawalsTableBody.appendChild(tr);
            });
        } catch (error) {
            console.error(error);
        }
    }
    
    // --- Carregar Meus Cupons ---
    async function loadCoupons() {
         try {
            const res = await fetch('/api/affiliate/dashboard'); // Reusa a rota
            if (!res.ok) throw new Error('Falha ao carregar cupons');
            const data = await res.json();
            
            couponsTableBody.innerHTML = '';
            if (data.myCoupons.length === 0) {
                couponsTableBody.innerHTML = '<tr><td colspan="3">Nenhum cupom vinculado.</td></tr>';
            }
            
            data.myCoupons.forEach(c => {
                const tr = document.createElement('tr');
                const discount = c.discountType === 'percentage'
                    ? `${c.discountValue}%`
                    : `R$ ${(c.discountValue / 100).toFixed(2)}`;
                
                tr.innerHTML = `
                    <td><strong>${c.code}</strong></td>
                    <td>${discount}</td>
                    <td>${c.uses}</td>
                `;
                couponsTableBody.appendChild(tr);
            });
        } catch (error) {
            console.error(error);
        }
    }

    // --- Lógica do Modal de Saque ---
    const openModal = () => {
        modalAmount.textContent = `R$ ${(currentBalance / 100).toFixed(2)}`;
        termsCheckbox.checked = false;
        btnConfirmWithdrawal.disabled = true;
        modal.style.display = 'block';
    };
    const closeModal = () => modal.style.display = 'none';

    btnRequestWithdrawal.addEventListener('click', openModal);
    modalCloseBtn.addEventListener('click', closeModal);
    btnCancelModal.addEventListener('click', closeModal);
    
    termsCheckbox.addEventListener('change', () => {
        btnConfirmWithdrawal.disabled = !termsCheckbox.checked;
    });

    // --- Enviar Pedido de Saque ---
    btnConfirmWithdrawal.addEventListener('click', async () => {
        btnConfirmWithdrawal.disabled = true;
        btnConfirmWithdrawal.innerHTML = '<div class="btn-loading-spinner"></div>';

        try {
            const res = await fetch('/api/affiliate/request-withdrawal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: currentBalance }) // Envia o saldo total
            });
            
            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.message || 'Erro desconhecido');
            }

            alert('Solicitação de saque enviada com sucesso!');
            closeModal();
            loadDashboardStats(); // Recarrega os dados (saldo vai zerar)
            loadWithdrawals(); // Recarrega o histórico

        } catch (error) {
            alert(`Erro: ${error.message}`);
        } finally {
             btnConfirmWithdrawal.disabled = false;
             btnConfirmWithdrawal.innerHTML = 'Confirmar Solicitação';
        }
    });

    // Carregamento Inicial
    loadDashboardStats();
});