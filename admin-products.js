document.addEventListener('DOMContentLoaded', () => {
    // Elementos da Página
    const productsTableBody = document.getElementById('products-table-body');
    const btnNewProduct = document.getElementById('btn-new-product');
    
    // Elementos do Modal
    const modal = document.getElementById('product-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const btnCancelModal = document.getElementById('btn-cancel-modal');
    const modalTitle = document.getElementById('modal-title');
    const productForm = document.getElementById('product-form');
    const btnSaveProduct = document.getElementById('btn-save-product');
    
    // (MODIFICADO) Elementos de Imagem e Planos
    const imageUrlsContainer = document.getElementById('image-urls-container');
    const btnAddImage = document.getElementById('btn-add-image');
    
    // Inputs do Formulário
    const productIdInput = document.getElementById('productId');
    const nameInput = document.getElementById('name');
    const categoryInput = document.getElementById('category'); // <--- AGORA É DINÂMICO
    const descriptionInput = document.getElementById('description');
    const keysInput = document.getElementById('keys');

    // Inputs de Planos Pré-definidos
    const planGroups = [
        {
            check: document.getElementById('plan-active-semana'),
            price: document.getElementById('plan-price-semana')
        },
        {
            check: document.getElementById('plan-active-mes'),
            price: document.getElementById('plan-price-mes')
        },
        {
            check: document.getElementById('plan-active-trimestre'),
            price: document.getElementById('plan-price-trimestre')
        },
        {
            check: document.getElementById('plan-active-vitalicio'),
            price: document.getElementById('plan-price-vitalicio')
        }
    ];

    let currentProductId = null;

    // --- Funções do Modal ---
    const openModal = () => modal.style.display = 'block';
    const closeModal = () => {
        modal.style.display = 'none';
        productForm.reset();
        
        imageUrlsContainer.innerHTML = '<label>URLs de Imagem (a 1ª é a principal)</label>';
        
        planGroups.forEach(group => {
            group.check.checked = false;
            group.price.value = '';
            group.price.disabled = true;
        });

        currentProductId = null;
        modalTitle.textContent = 'Criar Novo Produto';
        btnSaveProduct.textContent = 'Salvar Produto';
    };

    // (MODIFICADO) btnNewProduct Listener
    btnNewProduct.addEventListener('click', () => {
        currentProductId = null;
        modalTitle.textContent = 'Criar Novo Produto';
        btnSaveProduct.textContent = 'Salvar Produto';
        loadCategoriesIntoModal(); // <-- ADICIONADO: Carrega categorias
        openModal();
    });
    modalCloseBtn.addEventListener('click', closeModal);
    btnCancelModal.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // --- Função de Adicionar URL de Imagem ---
    const addImageUrlInput = (url = '') => {
        const urlId = new Date().getTime();
        const urlElement = document.createElement('div');
        urlElement.classList.add('image-url-input-group'); 
        urlElement.dataset.id = urlId;
        urlElement.innerHTML = `
            <input type="text" class="image-url" placeholder="https://i.imgur.com/..." value="${url}" required>
            <button type="button" class="btn-remove-url">&times;</button>
        `;
        imageUrlsContainer.appendChild(urlElement);
        urlElement.querySelector('.btn-remove-url').addEventListener('click', () => {
            urlElement.remove();
        });
    };
    btnAddImage.addEventListener('click', () => addImageUrlInput());


    // --- Lógica dos Planos Pré-definidos ---
    planGroups.forEach(group => {
        group.check.addEventListener('change', () => {
            group.price.disabled = !group.check.checked;
            if (!group.check.checked) {
                group.price.value = '';
            }
        });
    });

    // --- (NOVO) Carregar Categorias no Modal ---
    const loadCategoriesIntoModal = async () => {
        try {
            const response = await fetch('/api/admin/categories');
            if (!response.ok) throw new Error('Falha ao buscar categorias');
            const categories = await response.json();
            
            categoryInput.innerHTML = '<option value="">-- Selecione uma categoria --</option>'; // Limpa
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat._id; // O valor é o ID
                option.textContent = cat.name; // O texto é o Nome
                categoryInput.appendChild(option);
            });
        } catch (error) {
            console.error(error);
            categoryInput.innerHTML = '<option value="">Erro ao carregar categorias</option>';
        }
    };

    // --- Carregar Produtos na Tabela ---
    const loadProducts = async () => {
        try {
            const response = await fetch('/api/admin/products'); 
            if (!response.ok) throw new Error('Erro ao carregar produtos');
            const products = await response.json();

            productsTableBody.innerHTML = ''; 
            products.forEach(product => {
                const availableKeys = product.keys.filter(k => !k.isSold).length;
                const totalKeys = product.keys.length;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${product.name}</td>
                    <td>${product.category ? product.category.name : 'Sem Categoria'}</td>
                    <td>${product.plans.length} plano(s)</td>
                    <td>${availableKeys} / ${totalKeys} (Disp / Total)</td>
                    <td class="actions">
                        <button class="btn-action edit" data-id="${product._id}"><i class="fas fa-edit"></i></button>
                        <button class="btn-action delete" data-id="${product._id}"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                productsTableBody.appendChild(tr);
            });
        } catch (error) {
            console.error(error);
            alert('Falha ao carregar produtos.');
        }
    };

    // --- Salvar (Criar ou Editar) Produto (MODIFICADO) ---
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Coletar dados das imagens
        const imageUrls = [];
        document.querySelectorAll('.image-url-input-group .image-url').forEach(input => {
            if (input.value.trim()) imageUrls.push(input.value.trim());
        });
        if (imageUrls.length === 0) {
            alert('Adicione pelo menos uma URL de imagem.');
            return;
        }

        // 2. Coletar dados dos planos
        const plans = [];
        planGroups.forEach(group => {
            if (group.check.checked) {
                const price = parseFloat(group.price.value);
                if (isNaN(price) || price <= 0) {
                    alert(`Preencha um preço válido para o plano "${group.check.dataset.planName}"`);
                    throw new Error('Preço inválido');
                }
                plans.push({
                    name: group.check.dataset.planName,
                    price: price
                });
            }
        });
        if (plans.length === 0) {
            alert('Adicione pelo menos um plano de preço.');
            return;
        }

        // 3. Coletar dados das keys
        const keys = keysInput.value.split('\n')
            .map(key => key.trim())
            .filter(key => key.length > 0)
            .map(keyString => ({ key: keyString, isSold: false })); 

        // 4. Montar o objeto do produto (COM CATEGORIA ID)
        const productData = {
            name: nameInput.value,
            category: categoryInput.value, // <-- Envia o ID da categoria selecionada
            imageUrls: imageUrls, 
            description: descriptionInput.value,
            plans: plans,
            keys: keys // NOTA: Ao editar, isto irá SUBSTITUIR as keys existentes.
                       // Uma API mais avançada deveria apenas adicionar as novas.
        };
        
        try {
            let response;
            if (currentProductId) {
                // ATUALIZAR (PUT)
                // (Modo PUT não envia keys, pois não queremos sobrescrever)
                // (O usuário deve gerenciar keys manualmente por enquanto)
                // (Para simplificar, vamos permitir sobrescrever as keys)
                // TODO: Melhorar a lógica de 'keys' para não sobrescrever
                
                // Vamos remover as keys da atualização por enquanto para evitar
                // que o admin apague keys vendidas acidentalmente.
                // Apenas keys em BRANCO são adicionadas.
                // Se o campo keys estiver vazio, não mexe nas keys
                if (keys.length > 0) {
                    productData.keys = keys;
                } else {
                    delete productData.keys; // Não atualiza as keys se o campo estiver vazio
                }

                response = await fetch(`/api/admin/products/${currentProductId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(productData)
                });
            } else {
                // CRIAR (POST)
                response = await fetch('/api/admin/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(productData)
                });
            }

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Falha ao salvar produto');
            }

            closeModal();
            loadProducts(); 

        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    });

    // --- Delegação de Eventos (Editar e Deletar) ---
    productsTableBody.addEventListener('click', async (e) => {
        const button = e.target.closest('.btn-action');
        if (!button) return;

        const id = button.dataset.id;
        
        // --- Botão DELETAR ---
        if (button.classList.contains('delete')) {
            if (!confirm('Tem certeza que deseja deletar este produto?')) {
                return;
            }
            try {
                const response = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Falha ao deletar');
                loadProducts();
            } catch (error) {
                alert(error.message);
            }
        }
        
        // --- Botão EDITAR (MODIFICADO) ---
        if (button.classList.contains('edit')) {
            try {
                // (ADICIONADO) Carrega as categorias primeiro
                await loadCategoriesIntoModal();
                
                const response = await fetch(`/api/products/id/${id}`); 
                if (!response.ok) throw new Error('Falha ao carregar dados do produto');
                const product = await response.json();

                // Preenche o formulário
                currentProductId = product._id;
                nameInput.value = product.name;
                
                // (ALTERADO) Seleciona a categoria correta
                // product.category pode ser um ID (string) ou um objeto (se populado)
                categoryInput.value = product.category ? product.category._id : '';
                
                descriptionInput.value = product.description;
                
                // Limpa e preenche as URLs de imagem
                imageUrlsContainer.innerHTML = '<label>URLs de Imagem (a 1ª é a principal)</label>';
                product.imageUrls.forEach(url => addImageUrlInput(url));

                // Limpa e preenche os planos pré-definidos
                planGroups.forEach(group => {
                    const savedPlan = product.plans.find(p => p.name === group.check.dataset.planName);
                    if (savedPlan) {
                        group.check.checked = true;
                        group.price.value = savedPlan.price;
                        group.price.disabled = false;
                    } else {
                        group.check.checked = false;
                        group.price.value = '';
                        group.price.disabled = true;
                    }
                });

                // Preenche as keys (somente as não vendidas)
                // (Nota: Ao salvar, as keys não vendidas serão sobrescritas)
                keysInput.value = product.keys
                    .filter(k => !k.isSold)
                    .map(k => k.key)
                    .join('\n');
                
                modalTitle.textContent = 'Editar Produto';
                btnSaveProduct.textContent = 'Salvar Alterações';
                openModal();
            } catch (error) {
                console.error(error);
                alert('Falha ao carregar dados do produto para edição.');
            }
        }
    });

    // --- Carregamento Inicial ---
    loadProducts();
});