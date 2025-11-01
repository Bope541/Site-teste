document.addEventListener('DOMContentLoaded', () => {
    // Elementos da Página
    const couponsTableBody = document.getElementById('coupons-table-body');
    const btnNewCoupon = document.getElementById('btn-new-coupon');
    
    // Elementos do Modal
    const modal = document.getElementById('coupon-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const btnCancelModal = document.getElementById('btn-cancel-modal');
    const modalTitle = document.getElementById('modal-title');
    const couponForm = document.getElementById('coupon-form');
    const btnSaveCoupon = document.getElementById('btn-save-coupon');
    
    // Inputs do Formulário
    const couponIdInput = document.getElementById('couponId');
    const codeInput = document.getElementById('code');
    const discountTypeInput = document.getElementById('discountType');
    const discountValueInput = document.getElementById('discountValue');
    const minPurchaseInput = document.getElementById('minPurchase');
    const expiresAtInput = document.getElementById('expiresAt');
    const maxUsesInput = document.getElementById('maxUses');
    const applicableProductsSelect = document.getElementById('applicableProducts');
    const isActiveInput = document.getElementById('isActive');

    let allProducts = []; // Para guardar a lista de produtos

    // --- Funções do Modal ---
    const openModal = () => modal.style.display = 'block';
    const closeModal = () => {
        modal.style.display = 'none';
        couponForm.reset();
        couponIdInput.value = '';
        applicableProductsSelect.value = null; // Limpa seleção
        modalTitle.textContent = 'Criar Novo Cupom';
    };

    btnNewCoupon.addEventListener('click', () => {
        couponForm.reset();
        couponIdInput.value = '';
        isActiveInput.checked = true; // Padrão
        modalTitle.textContent = 'Criar Novo Cupom';
        loadProductsIntoModal(); // Carrega produtos no modal
        openModal();
    });
    modalCloseBtn.addEventListener('click', closeModal);
    btnCancelModal.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // --- Carregar Produtos no Modal ---
    const loadProductsIntoModal = async () => {
        // Se já carregamos, não precisa buscar de novo
        if (allProducts.length > 0) {
            applicableProductsSelect.innerHTML = allProducts.map(p => 
                `<option value="${p._id}">${p.name}</option>`
            ).join('');
            return;
        }
        
        // Busca pela primeira vez
        try {
            const res = await fetch('/api/admin/products');
            allProducts = await res.json();
            applicableProductsSelect.innerHTML = allProducts.map(p => 
                `<option value="${p._id}">${p.name}</option>`
            ).join('');
        } catch (error) {
            console.error('Falha ao carregar produtos', error);
        }
    };

    // --- Carregar Cupons na Tabela ---
    const loadCoupons = async () => {
        try {
            const response = await fetch('/api/admin/coupons');
            if (!response.ok) throw new Error('Erro ao carregar cupons');
            const coupons = await response.json();

            couponsTableBody.innerHTML = ''; 
            coupons.forEach(coupon => {
                const tr = document.createElement('tr');
                
                const status = coupon.isActive ? '<span class="status-paid">Ativo</span>' : '<span class="status-pending">Inativo</span>';
                const value = coupon.discountType === 'percentage' 
                    ? `${coupon.discountValue}%` 
                    : `R$ ${(coupon.discountValue / 100).toFixed(2)}`;
                
                const uses = `${coupon.uses} / ${coupon.maxUses || '∞'}`;
                const expires = coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString('pt-BR') : 'Nunca';

                tr.innerHTML = `
                    <td>${coupon.code}</td>
                    <td>${coupon.discountType}</td>
                    <td>${value}</td>
                    <td>${status}</td>
                    <td>${uses}</td>
                    <td>${expires}</td>
                    <td class="actions">
                        <button class="btn-action edit" data-id="${coupon._id}"><i class="fas fa-edit"></i></button>
                        <button class="btn-action delete" data-id="${coupon._id}"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                couponsTableBody.appendChild(tr);
            });
        } catch (error) {
            console.error(error);
            alert('Falha ao carregar cupons.');
        }
    };

    // --- Salvar (Criar ou Editar) Cupom ---
    couponForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Pega os IDs dos produtos selecionados
        const selectedProducts = Array.from(applicableProductsSelect.selectedOptions).map(opt => opt.value);
        
        // Converte valores para o formato do DB
        let discountValue = parseFloat(discountValueInput.value);
        let minPurchase = parseFloat(minPurchaseInput.value || 0);
        
        if (discountTypeInput.value === 'fixed') {
            discountValue *= 100; // Converte R$ 10,00 para 1000 centavos
        }
        minPurchase *= 100; // Converte R$ 50,00 para 5000 centavos

        const couponData = {
            code: codeInput.value.toUpperCase(),
            discountType: discountTypeInput.value,
            discountValue: discountValue,
            minPurchase: minPurchase,
            expiresAt: expiresAtInput.value || null,
            maxUses: parseInt(maxUsesInput.value) || null, // null = infinito
            applicableProducts: selectedProducts,
            isActive: isActiveInput.checked
        };
        
        const couponId = couponIdInput.value;
        const url = couponId ? `/api/admin/coupons/${couponId}` : '/api/admin/coupons';
        const method = couponId ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(couponData)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Falha ao salvar cupom');
            }

            closeModal();
            loadCoupons();

        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    });

    // --- Delegação de Eventos (Editar e Deletar) ---
    couponsTableBody.addEventListener('click', async (e) => {
        const button = e.target.closest('.btn-action');
        if (!button) return;

        const id = button.dataset.id;
        
        // --- Botão DELETAR ---
        if (button.classList.contains('delete')) {
            if (!confirm('Tem certeza que deseja deletar este cupom? Esta ação é irreversível.')) {
                return;
            }
            try {
                const response = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Falha ao deletar cupom');
                loadCoupons();
            } catch (error) {
                console.error(error);
                alert(error.message);
            }
        }
        
        // --- Botão EDITAR ---
        if (button.classList.contains('edit')) {
            try {
                await loadProductsIntoModal(); // Garante que os produtos estão no select
                
                const response = await fetch(`/api/admin/coupons/${id}`); 
                if (!response.ok) throw new Error('Falha ao carregar dados do cupom');
                const coupon = await response.json();

                // Preenche o formulário
                couponIdInput.value = coupon._id;
                codeInput.value = coupon.code;
                discountTypeInput.value = coupon.discountType;
                
                // Converte centavos de volta para Reais/Valor
                if (coupon.discountType === 'fixed') {
                    discountValueInput.value = (coupon.discountValue / 100).toFixed(2);
                } else {
                    discountValueInput.value = coupon.discountValue;
                }
                minPurchaseInput.value = (coupon.minPurchase / 100).toFixed(2);

                expiresAtInput.value = coupon.expiresAt ? coupon.expiresAt.split('T')[0] : '';
                maxUsesInput.value = coupon.maxUses;
                isActiveInput.checked = coupon.isActive;

                // Seleciona os produtos aplicáveis
                Array.from(applicableProductsSelect.options).forEach(opt => {
                    opt.selected = coupon.applicableProducts.includes(opt.value);
                });
                
                modalTitle.textContent = 'Editar Cupom';
                openModal();
            } catch (error) {
                console.error(error);
                alert('Falha ao carregar dados do cupom para edição.');
            }
        }
    });

    // --- Carregamento Inicial ---
    loadCoupons();
});