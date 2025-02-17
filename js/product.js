document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (productId) {
        loadProductData(productId)
            .catch(error => {
                console.error('Ошибка загрузки:', error);
                alert('Ошибка загрузки данных товара');
                window.location.href = '/brow12/index.php';
            });
    } else {
        alert('Продукт не найден!');
        window.location.href = '/brow12/index.php';
    }

    // Обработчики табов
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.dataset.tab;
            document.querySelectorAll('.tab-button, .tab-pane').forEach(el => {
                el.classList.remove('active');
            });
            button.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
});

async function loadProductData(productId) {
    try {
        const response = await fetch(`/brow12/api/product.php?id=${productId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'success') {
            renderProductPage(data.data);
        } else {
            throw new Error(data.message || 'Ошибка сервера');
        }
    } catch (error) {
        throw new Error(`Не удалось загрузить данные: ${error.message}`);
    }
}

function renderProductPage(apiData) {
    // Проверка структуры ответа
    if (!apiData?.data?.product) {
        console.error('Некорректные данные товара:', apiData);
        alert('Ошибка отображения товара');
        return;
    }

    const { product, characteristics, reviews } = apiData.data;

    // Основная информация
    document.querySelector('.product-image').src = `/brow12/${product.image_url}`;
    document.querySelector('.product-name').textContent = product.product_name;
    document.querySelector('.product-category').textContent = product.category_name;

    // Цены
    const priceContainer = document.querySelector('.price-container');
    const finalPrice = product.final_price ?? product.price; // Защита от null
    
    if (product.discount > 0) {
        const discountAmount = product.price - finalPrice;
        priceContainer.innerHTML = `
            <span class="old-price">${product.price.toLocaleString('ru-RU')} ₽</span>
            <span class="discount">-${Math.round(product.discount)}%</span>
            <span class="final-price">${finalPrice.toLocaleString('ru-RU')} ₽</span>
        `;
    } else {
        priceContainer.innerHTML = `
            <span class="final-price">${product.price.toLocaleString('ru-RU')} ₽</span>
        `;
    }

    // Характеристики
    const specsList = document.querySelector('.specifications-list');
    specsList.innerHTML = characteristics.length > 0 
        ? characteristics.map(c => `
            <li class="spec-item">
                <span class="spec-name">${c.name}:</span>
                <span class="spec-value">${c.value || '—'}</span>
            </li>
        `).join('')
        : '<li>Характеристики не указаны</li>';

    // Отзывы
    const reviewsList = document.querySelector('.reviews-list');
    reviewsList.innerHTML = reviews.length > 0
        ? reviews.map(r => `
            <div class="review">
                <div class="review-header">
                    <span class="review-author">${r.author || 'Аноним'}</span>
                    <span class="review-date">${new Date(r.created_at).toLocaleDateString()}</span>
                </div>
                <div class="review-rating">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
                <div class="review-comment">${r.comment || 'Без комментария'}</div>
            </div>
        `).join('')
        : '<div class="no-reviews">Отзывов пока нет</div>';
}