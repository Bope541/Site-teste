document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('categories-table-body');
    const btnNewCategory = document.getElementById('btn-new-category');
    
    // Elementos do Modal
    const modal = document.getElementById('category-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const btnCancelModal = document.getElementById('btn-cancel-modal');
    const modalTitle = document.getElementById('modal-title');
    const categoryForm = document.getElementById('category-form');
    const categoryIdInput = document.getElementById('categoryId');
    const nameInput = document.getElementById('name');

    // --- Funções do Modal ---
    const openModal = () => modal.style.display = 'block';
    const closeModal = () => {
        modal.style.display = 'none';
        categoryForm.reset();
        categoryIdInput.value = '';
    };

    btnNewCategory.addEventListener('click', () => {
        modalTitle.textContent = 'Nova Categoria';
        openModal();
    });
    modalCloseBtn.addEventListener('click', closeModal);
    btnCancelModal.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // --- Carregar Categorias na Tabela ---
    const loadCategories = async () => {
        try {
            const response = await fetch('/api/admin/categories');
            if (!response.ok) throw new Error('Erro ao carregar categorias');
            const categories = await response.json();

            tableBody.innerHTML = '';
            categories.forEach(cat => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${cat.name}</td>
                    <td>${cat.slug}</td>
                    <td class="actions">
                        <button class="btn-action edit" data-id="${cat._id}" data-name="${cat.name}"><i class="fas fa-edit"></i></button>
                        <button class="btn-action delete" data-id="${cat._id}"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });
        } catch (error) {
            console.error(error);
            tableBody.innerHTML = `<tr><td colspan="3">Erro ao carregar categorias.</td></tr>`;
        }
    };

    // --- Salvar (Criar ou Editar) Categoria ---
    categoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const categoryId = categoryIdInput.value;
        const categoryData = {
            name: nameInput.value
        };

        const url = categoryId ? `/api/admin/categories/${categoryId}` : '/api/admin/categories';
        const method = categoryId ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(categoryData)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Falha ao salvar categoria');
            }

            closeModal();
            loadCategories();

        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    });

    // --- Delegação de Eventos (Editar e Deletar) ---
    tableBody.addEventListener('click', async (e) => {
        const button = e.target.closest('.btn-action');
        if (!button) return;

        const id = button.dataset.id;
        
        // --- Botão DELETAR ---
        if (button.classList.contains('delete')) {
            if (!confirm('Tem certeza que deseja deletar esta categoria? (Produtos nela ficarão sem categoria e podem causar erros)')) {
                return;
            }
            try {
                const response = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Falha ao deletar');
                loadCategories();
            } catch (error) {
                alert(error.message);
            }
        }
        
        // --- Botão EDITAR ---
        if (button.classList.contains('edit')) {
            categoryIdInput.value = id;
            nameInput.value = button.dataset.name;
            modalTitle.textContent = 'Editar Categoria';
            openModal();
        }
    });

    // Carregamento Inicial
    loadCategories();
});