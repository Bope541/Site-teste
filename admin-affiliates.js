document.addEventListener('DOMContentLoaded', () => {
    // Elementos da Página
    const affiliatesTableBody = document.getElementById('affiliates-table-body');
    const btnNewAffiliate = document.getElementById('btn-new-affiliate');
    
    // Elementos do Modal
    const modal = document.getElementById('affiliate-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const btnCancelModal = document.getElementById('btn-cancel-modal');
    const modalTitle = document.getElementById('modal-title');
    const affiliateForm = document.getElementById('affiliate-form');
    
    // Inputs do Formulário
    const affiliateIdInput = document.getElementById('affiliateId');
    const usernameInput = document.getElementById('username');
    const fullNameInput = document.getElementById('fullName');
    const discordIdInput = document.getElementById('discordId');
    const commissionRateInput = document.getElementById('commissionRate');
    const twitterInput = document.getElementById('social-twitter');
    const youtubeInput = document.getElementById('social-youtube');
    const linkedCouponsSelect = document.getElementById('linkedCoupons');
    const statusInput = document.getElementById('status');

    // (NOVOS) Inputs de Pagamento
    const paymentAccountHolderNameInput = document.getElementById('payment-accountHolderName');
    const paymentPixKeyTypeInput = document.getElementById('payment-pixKeyType');
    const paymentPixKeyInput = document.getElementById('payment-pixKey');

    let allCoupons = []; // Para guardar a lista de cupons

    // --- Funções do Modal ---
    const openModal = () => modal.style.display = 'block';
    const closeModal = () => {
        modal.style.display = 'none';
        affiliateForm.reset();
        affiliateIdInput.value = '';
        modalTitle.textContent = 'Novo Afiliado';
        commissionRateInput.value = 25; // Resetar padrão
    };

    btnNewAffiliate.addEventListener('click', async () => {
        affiliateForm.reset();
        affiliateIdInput.value = '';
        commissionRateInput.value = 25;
        statusInput.value = 'active';
        modalTitle.textContent = 'Novo Afiliado';
        await loadCouponsIntoModal();
        openModal();
    });
    modalCloseBtn.addEventListener('click', closeModal);
    btnCancelModal.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // --- Carregar Cupons no Modal ---
    const loadCouponsIntoModal = async () => {
        if (allCoupons.length > 0) {
            linkedCouponsSelect.innerHTML = allCoupons.map(c => 
                `<option value="${c._id}">${c.code}</option>`
            ).join('');
            return;
        }
        try {
            const res = await fetch('/api/admin/coupons');
            allCoupons = await res.json();
            linkedCouponsSelect.innerHTML = allCoupons.map(c => 
                `<option value="${c._id}">${c.code}</option>`
            ).join('');
        } catch (error) {
            console.error('Falha ao carregar cupons', error);
        }
    };

    // --- Carregar Afiliados na Tabela ---
    const loadAffiliates = async () => {
        try {
            const response = await fetch('/api/admin/affiliates');
            if (!response.ok) throw new Error('Erro ao carregar afiliados');
            const affiliates = await response.json();

            affiliatesTableBody.innerHTML = ''; 
            affiliates.forEach(affiliate => {
                const tr = document.createElement('tr');
                
                let statusClass = 'status-pending'; // Inativo
                if (affiliate.status === 'active') statusClass = 'status-paid'; // Ativo
                if (affiliate.status === 'banned') statusClass = 'status-cancelled'; // Banido (usando uma cor de erro se tiver)

                tr.innerHTML = `
                    <td>${affiliate.user.username} (${affiliate.fullName})</td>
                    <td><span class="${statusClass}">${affiliate.status}</span></td>
                    <td>R$ ${(affiliate.balance / 100).toFixed(2)}</td>
                    <td>R$ ${(affiliate.totalEarned / 100).toFixed(2)}</td>
                    <td>${affiliate.linkedCoupons.map(c => c.code).join(', ')}</td>
                    <td class="actions">
                        <button class="btn-action edit" data-id="${affiliate._id}"><i class="fas fa-edit"></i></button>
                        <button class="btn-action delete" data-id="${affiliate._id}"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                affiliatesTableBody.appendChild(tr);
            });
        } catch (error) {
            console.error(error);
            alert('Falha ao carregar afiliados.');
        }
    };

    // --- Salvar (Criar ou Editar) Afiliado (ATUALIZADO) ---
    affiliateForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const selectedCoupons = Array.from(linkedCouponsSelect.selectedOptions).map(opt => opt.value);

        // (ATUALIZADO) Monta o objeto com os dados de pagamento
        const affiliateData = {
            username: usernameInput.value, // O backend vai converter isso para um ID
            fullName: fullNameInput.value,
            discordId: discordIdInput.value,
            commissionRate: parseFloat(commissionRateInput.value),
            socials: {
                twitter: twitterInput.value,
                youtube: youtubeInput.value
            },
            linkedCoupons: selectedCoupons,
            status: statusInput.value,
            // (NOVO) Adiciona o objeto de pagamento
            paymentDetails: {
                accountHolderName: paymentAccountHolderNameInput.value,
                pixKeyType: paymentPixKeyTypeInput.value,
                pixKey: paymentPixKeyInput.value
            }
        };
        
        const affiliateId = affiliateIdInput.value;
        const url = affiliateId ? `/api/admin/affiliates/${affiliateId}` : '/api/admin/affiliates';
        const method = affiliateId ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(affiliateData)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Falha ao salvar afiliado');
            }

            closeModal();
            loadAffiliates();

        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    });

    // --- Delegação de Eventos (Editar e Deletar) (ATUALIZADO) ---
    affiliatesTableBody.addEventListener('click', async (e) => {
        const button = e.target.closest('.btn-action');
        if (!button) return;

        const id = button.dataset.id;
        
        // --- Botão DELETAR ---
        if (button.classList.contains('delete')) {
            if (!confirm('Tem certeza que deseja remover este afiliado? (Isso não remove o usuário, apenas o status de afiliado).')) {
                return;
            }
            try {
                const response = await fetch(`/api/admin/affiliates/${id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Falha ao deletar afiliado');
                loadAffiliates();
            } catch (error) {
                console.error(error);
                alert(error.message);
            }
        }
        
        // --- Botão EDITAR (ATUALIZADO) ---
        if (button.classList.contains('edit')) {
            try {
                await loadCouponsIntoModal();
                
                const response = await fetch(`/api/admin/affiliates/${id}`); 
                if (!response.ok) throw new Error('Falha ao carregar dados do afiliado');
                const affiliate = await response.json();

                // Preenche o formulário
                affiliateIdInput.value = affiliate._id;
                usernameInput.value = affiliate.user.username;
                fullNameInput.value = affiliate.fullName;
                discordIdInput.value = affiliate.discordId || '';
                commissionRateInput.value = affiliate.commissionRate;
                twitterInput.value = affiliate.socials?.twitter || '';
                youtubeInput.value = affiliate.socials?.youtube || '';
                statusInput.value = affiliate.status;

                // (ATUALIZADO) Preenche os dados de pagamento
                if (affiliate.paymentDetails) {
                    paymentAccountHolderNameInput.value = affiliate.paymentDetails.accountHolderName;
                    paymentPixKeyTypeInput.value = affiliate.paymentDetails.pixKeyType;
                    paymentPixKeyInput.value = affiliate.paymentDetails.pixKey;
                } else {
                    paymentAccountHolderNameInput.value = '';
                    paymentPixKeyTypeInput.value = '';
                    paymentPixKeyInput.value = '';
                }

                // Seleciona os cupons
                Array.from(linkedCouponsSelect.options).forEach(opt => {
                    opt.selected = affiliate.linkedCoupons.some(c => c._id === opt.value);
                });
                
                modalTitle.textContent = 'Editar Afiliado';
                openModal();
            } catch (error) {
                console.error(error);
                alert('Falha ao carregar dados do afiliado para edição.');
            }
        }
    });

    // --- Carregamento Inicial ---
    loadAffiliates();
});