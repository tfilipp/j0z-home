// Основные элементы
const categoryTabs = document.querySelectorAll('.category-tab');
const appCards = document.querySelectorAll('.app-card');
const viewButtons = document.querySelectorAll('.view-btn');
const gridView = document.querySelector('.apps-grid');
const categoriesView = document.querySelector('.apps-categories');

// Плавная прокрутка к разделу приложений
function scrollToApps() {
    document.getElementById('apps').scrollIntoView({
        behavior: 'smooth'
    });
}

// Фильтрация по категориям
categoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Удаляем активный класс у всех табов
        categoryTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const category = tab.dataset.category;
        
        // Фильтруем карточки
        appCards.forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });

        // Перезапускаем анимацию для видимых карточек
        const visibleCards = document.querySelectorAll('.app-card[style*="flex"]');
        visibleCards.forEach((card, index) => {
            card.style.animation = 'none';
            card.offsetHeight; // Триггер перерисовки
            card.style.animation = null;
            card.style.animationDelay = `${index * 0.1}s`;
        });
    });
});

// Организация карточек по категориям
function organizeByCategories() {
    const categories = {};
    
    // Очищаем все контейнеры категорий перед добавлением
    document.querySelectorAll('.category-items').forEach(container => {
        container.innerHTML = '';
    });
    
    // Собираем только карточки из grid-view
    document.querySelector('.apps-grid').querySelectorAll('.app-card').forEach(card => {
        const category = card.dataset.category;
        if (!categories[category]) {
            categories[category] = [];
        }
        categories[category].push(card.cloneNode(true));
    });

    document.querySelectorAll('.category-section').forEach(section => {
        const category = section.dataset.category;
        const items = section.querySelector('.category-items');
        
        if (categories[category] && categories[category].length > 0) {
            categories[category].forEach(card => {
                items.appendChild(card);
            });
            section.style.display = 'block';
        } else {
            section.style.display = 'none';
        }
    });
}

// Обработчик переключения видов
viewButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        
        // Обновляем активную кнопку
        viewButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Переключаем вид
        if (view === 'grid') {
            gridView.style.display = 'grid';
            categoriesView.style.display = 'none';
            categoryTabs.forEach(tab => tab.style.display = 'block');
        } else {
            gridView.style.display = 'none';
            categoriesView.style.display = 'block';
            categoryTabs.forEach(tab => tab.style.display = 'none');
            organizeByCategories();
        }
    });
});

// Анимация появления карточек
function animateCards() {
    const cards = document.querySelectorAll('.app-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    animateCards();
    organizeByCategories();
    
    // Проверяем активный вид и скрываем/показываем табы
    const activeView = document.querySelector('.view-btn.active').dataset.view;
    if (activeView === 'categories') {
        categoryTabs.forEach(tab => tab.style.display = 'none');
    }
});