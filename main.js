function scrollToApps() {
    document.getElementById('apps').scrollIntoView({
        behavior: 'smooth'
    });
}

const categoryTabs = document.querySelectorAll('.category-tab');
const appCards = document.querySelectorAll('.app-card');

categoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        categoryTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const category = tab.dataset.category;
        
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
            card.offsetHeight; // триггер перерисовки
            card.style.animation = null;
            card.style.animationDelay = `${index * 0.1}s`;
        });
    });
});

function animateCards() {
    const cards = document.querySelectorAll('.app-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
}

document.addEventListener('DOMContentLoaded', animateCards);