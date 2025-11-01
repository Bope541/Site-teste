document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('withdrawals-table-body');
    
    // Elementos do Modal
    const modal = document.getElementById('withdrawal-details-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalTitle = document.getElementById('modal-title');
    const modalActionButtons = document.getElementById('modal-action-buttons');
    const rejectionGroup = document.getElementById('rejection-reason-group');
    const rejectionInput = document.getElementById('rejection-reason');

    let allWithdrawals = []; // Cache local
    let currentWithdrawalId = null;

    // --- Funções do Modal ---
    const openModal = () => modal.style.display = 'block';
    const closeModal = () => {
        modal.style.display = 'none';
        rejectionGroup.style.display = 'none';
        rejectionInput.value = '';
        currentWithdrawalId = null;
    };
    
    modalCloseBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // --- Carregar Saques na Tabela ---
    const loadWithdrawals = async () => {
        try {
            const response = await fetch('/api/admin/withdrawals');
            if (!response.ok) throw new Error('Erro ao carregar saques');
            
            allWithdrawals = await response.json();
            renderTable(allWithdrawals);

        } catch (error) {
            console.error(error);
            tableBody.innerHTML = `<tr><td colspan="5">Erro ao carregar dados: ${error.message}</td></tr>`;
        }
    };
    
    const renderTable = (withdrawals) => {
        tableBody.innerHTML = '';
        if (withdrawals.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5">Nenhuma solicitação de saque encontrada.</td></tr>';
            return;
        }

        withdrawals.forEach(w => {
            const tr = document.createElement('tr');
            let statusClass = '', statusText = '';

            switch(w.status) {
                case 'pending':
                    statusClass = 'status-pending';
                    statusText = 'Pendente';
                    break;
                case 'approved':
                    statusClass = 'status-approved';
                    statusText = 'Aguardando Pagamento';
                    break;
                case 'completed':
                    statusClass = 'status-paid'; // Reusa a classe verde
                    statusText = 'Pago';
                    break;
                case 'rejected':
                    statusClass = 'status-rejected';
                    statusText = 'Recusado';
                    break;
            }

            tr.innerHTML = `
                <td>${new Date(w.createdAt).toLocaleDateString('pt-BR')}</td>
                <td>${w.affiliate.fullName} (${w.affiliate.user.username})</td>
                <td>R$ ${(w.amount / 100).toFixed(2)}</td>
                <td><span class="${statusClass}">${statusText}</span></td>
                <td class="actions">
                    <button class="btn-action edit" data-id="${w._id}"><i class="fas fa-eye"></i> Ver Detalhes</button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    };

    // --- Abrir Modal e Popular Dados ---
    tableBody.addEventListener('click', (e) => {
        const button = e.target.closest('.btn-action.edit');
        if (!button) return;

        currentWithdrawalId = button.dataset.id;
        const withdrawal = allWithdrawals.find(w => w._id === currentWithdrawalId);
        
        if (!withdrawal) {
            alert('Erro: Saque não encontrado');
            return;
        }

        // Preenche Infos
        document.getElementById('detail-user-id').textContent = withdrawal.affiliate.user._id;
        document.getElementById('detail-user-username').textContent = withdrawal.affiliate.user.username;
        document.getElementById('detail-affiliate-name').textContent = withdrawal.affiliate.fullName;
        
        // Preenche Saque
        document.getElementById('detail-withdrawal-id').textContent = withdrawal._id;
        document.getElementById('detail-request-date').textContent = new Date(withdrawal.createdAt).toLocaleString('pt-BR');
        document.getElementById('detail-amount').textContent = `R$ ${(withdrawal.amount / 100).toFixed(2)}`;
        
        // Preenche PIX
        const pix = withdrawal.paymentDetailsSnapshot;
        document.getElementById('detail-pix-name').textContent = pix.accountHolderName;
        document.getElementById('detail-pix-type').textContent = pix.pixKeyType;
        document.getElementById('detail-pix-key').textContent = pix.pixKey;
        
        // Atualiza Status e Botões
        updateModalActions(withdrawal.status);
        openModal();
    });

    // --- Atualiza Botões do Modal ---
    const updateModalActions = (status) => {
        modalActionButtons.innerHTML = ''; // Limpa botões
        rejectionGroup.style.display = 'none'; // Esconde campo de recusa
        
        const statusBadge = document.getElementById('detail-status');
        
        if (status === 'pending') {
            statusBadge.className = 'status-badge status-pending';
            statusBadge.textContent = 'Pendente';
            modalActionButtons.innerHTML = `
                <button type="button" class="btn btn-secondary" data-action="reject">Recusar Saque</button>
                <button type="button" class="btn btn-primary" data-action="approve">Aprovar Saque</button>
            `;
        } else if (status === 'approved') {
            statusBadge.className = 'status-badge status-approved';
            statusBadge.textContent = 'Aguardando Pagamento';
            modalActionButtons.innerHTML = `
                <button type="button" class="btn btn-secondary" data-action="reject">Cancelar Saque (Estornar)</button>
                <button type="button" class="btn btn-primary" data-action="complete">Marcar como Pago</button>
            `;
        } else if (status === 'completed') {
            statusBadge.className = 'status-badge status-paid';
            statusBadge.textContent = 'Pagamento Realizado';
            // Sem ações
        } else if (status === 'rejected') {
            statusBadge.className = 'status-badge status-rejected';
            statusBadge.textContent = 'Recusado/Cancelado';
            // Sem ações
        }
    };
    
    // --- Lógica de Ações (Aprovar/Recusar/Completar) ---
    modalActionButtons.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if (!action) return;
        
        if (action === 'reject') {
            rejectionGroup.style.display = 'block'; // Mostra o motivo
            // Se o campo de motivo já estiver visível, envia
            if (rejectionInput.value.trim() !== '') {
                updateWithdrawalStatus('rejected', rejectionInput.value.trim());
            } else {
                alert('Por favor, informe o motivo da recusa.');
            }
        }
        
        if (action === 'approve') {
            updateWithdrawalStatus('approved');
        }
        
        if (action === 'complete') {
            updateWithdrawalStatus('completed');
        }
    });

    // --- Função de API para Atualizar Status ---
    const updateWithdrawalStatus = async (newStatus, reason = null) => {
        if (!currentWithdrawalId) return;
        
        try {
            const body = {
                status: newStatus,
                reason: reason
            };
            
            const response = await fetch(`/api/admin/withdrawals/${currentWithdrawalId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Falha ao atualizar status');
            }

            alert(`Saque atualizado para: ${newStatus}`);
            closeModal();
            loadWithdrawals(); // Recarrega a tabela

        } catch (error) {
            console.error(error);
            alert(`Erro: ${error.message}`);
        }
    };

    // Carregamento Inicial
    loadWithdrawals();
});