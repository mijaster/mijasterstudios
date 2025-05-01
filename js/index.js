let currentNews = null;
let currentImageIndex = 0;
let modalImageIndex = 0;
let galleryInterval;
let modalGalleryInterval;

// Инициализация галереи новостей
function initGalleryControls() {
    const gallery = document.getElementById('newsGallery');
    if (!gallery) return;
    
    const prevBtn = gallery.querySelector('.prev-btn');
    const nextBtn = gallery.querySelector('.next-btn');
    const dots = gallery.querySelectorAll('.pagination-dot');
    
    // Обработчики для галереи в карточке
    prevBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        showPrevNewsImage();
    });
    
    nextBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        showNextNewsImage();
    });
    
    dots.forEach((dot, index) => {
        dot.addEventListener('click', function(e) {
            e.stopPropagation();
            setNewsImage(index);
        });
    });

    startGalleryRotation();
    gallery.addEventListener('mouseenter', stopGalleryRotation);
    gallery.addEventListener('mouseleave', startGalleryRotation);
}

// Инициализация галереи в модальном окне
function initModalGalleryControls() {
    const prevBtn = document.querySelector('.modal-prev-btn');
    const nextBtn = document.querySelector('.modal-next-btn');
    
    prevBtn.addEventListener('click', showPrevModalImage);
    nextBtn.addEventListener('click', showNextModalImage);
    
    startModalGalleryRotation();
    
    const modal = document.getElementById('newsModal');
    modal.addEventListener('mouseenter', stopModalGalleryRotation);
    modal.addEventListener('mouseleave', startModalGalleryRotation);
}

function showNextNewsImage() {
    if (!currentNews) return;
    const nextIndex = (currentImageIndex + 1) % currentNews.covers.length;
    setNewsImage(nextIndex);
}

function showPrevNewsImage() {
    if (!currentNews) return;
    const prevIndex = (currentImageIndex - 1 + currentNews.covers.length) % currentNews.covers.length;
    setNewsImage(prevIndex);
}

function showNextModalImage() {
    if (!currentNews) return;
    const nextIndex = (modalImageIndex + 1) % currentNews.covers.length;
    setModalImage(nextIndex);
}

function showPrevModalImage() {
    if (!currentNews) return;
    const prevIndex = (modalImageIndex - 1 + currentNews.covers.length) % currentNews.covers.length;
    setModalImage(prevIndex);
}

function setNewsImage(index) {
    if (!currentNews || index === currentImageIndex) return;
    
    const slides = document.querySelectorAll('.gallery-slide');
    const dots = document.querySelectorAll('.pagination-dot');
    
    slides[currentImageIndex].classList.remove('active');
    dots[currentImageIndex].classList.remove('active');
    
    slides[index].classList.add('active');
    dots[index].classList.add('active');
    
    currentImageIndex = index;
    stopGalleryRotation();
    startGalleryRotation();
}

function setModalImage(index) {
    if (!currentNews || index === modalImageIndex) return;
    
    const banner = document.getElementById('modalBanner');
    const dots = document.querySelectorAll('.modal-pagination-dot');
    
    // Плавное исчезновение и появление нового изображения
    banner.style.opacity = '0';
    
    setTimeout(() => {
        banner.src = currentNews.covers[index];
        banner.style.opacity = '1';
        
        // Обновляем активную точку
        dots[modalImageIndex].classList.remove('active');
        dots[index].classList.add('active');
        
        modalImageIndex = index;
    }, 300);
    
    stopModalGalleryRotation();
    startModalGalleryRotation();
}

function startGalleryRotation() {
    stopGalleryRotation();
    galleryInterval = setInterval(showNextNewsImage, 7000);
}

function stopGalleryRotation() {
    if (galleryInterval) {
        clearInterval(galleryInterval);
        galleryInterval = null;
    }
}

function startModalGalleryRotation() {
    stopModalGalleryRotation();
    modalGalleryInterval = setInterval(showNextModalImage, 7000);
}

function stopModalGalleryRotation() {
    if (modalGalleryInterval) {
        clearInterval(modalGalleryInterval);
        modalGalleryInterval = null;
    }
}

function openNewsModal() {
    if (!currentNews) return;
    
    const modal = document.getElementById('newsModal');
    const banner = document.getElementById('modalBanner');
    const date = document.getElementById('modalDate');
    const title = document.getElementById('modalTitle');
    const text = document.getElementById('modalText');
    const pagination = document.getElementById('modalPagination');
    
    // Устанавливаем первую картинку как баннер
    banner.src = currentNews.covers[0];
    date.textContent = currentNews.date;
    title.textContent = currentNews.title;
    text.textContent = currentNews.text;
    
    // Создаем пагинацию для модального окна
    pagination.innerHTML = '';
    currentNews.covers.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = `modal-pagination-dot ${index === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => setModalImage(index));
        pagination.appendChild(dot);
    });
    
    // Сбрасываем индекс для модального окна
    modalImageIndex = 0;
    
    // Показываем модальное окно с анимацией
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Запускаем анимацию после небольшой задержки, чтобы сработал transition
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    // Инициализируем управление галереей в модальном окне
    initModalGalleryControls();
}

function closeNewsModal() {
    const modal = document.getElementById('newsModal');
    
    // Запускаем анимацию закрытия
    modal.classList.remove('show');
    
    // После завершения анимации скрываем модальное окно
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        stopModalGalleryRotation();
    }, 300);
}

// Обновляем функцию loadLatestNews
function loadLatestNews() {
    fetch('json/news_config.json')
        .then(response => response.json())
        .then(data => {
            const latestNews = data.news.reduce((latest, current) => {
                return new Date(current.date.split('-').reverse().join('-')) > 
                       new Date(latest.date.split('-').reverse().join('-')) ? current : latest;
            });

            currentNews = latestNews;
            const isLongText = latestNews.text.length > 300;
            
            const lastNewsContainer = document.getElementById('last-news-container');
            // Обновляем HTML-генерацию в функции loadLatestNews
            lastNewsContainer.innerHTML = `
            <div class="news-gallery" id="newsGallery">
                <div class="gallery-slides">
                        ${latestNews.covers.map((cover, index) => `
                            <img src="${cover}" class="gallery-slide ${index === 0 ? 'active' : ''}" 
                                 alt="${latestNews.title}" data-index="${index}">
                        `).join('')}
                    </div>
                    <div class="gallery-controls">
                        <button class="gallery-btn prev-btn"><i class="fas fa-chevron-left"></i></button>
                        <button class="gallery-btn next-btn"><i class="fas fa-chevron-right"></i></button>
                        <div class="gallery-pagination">
                            ${latestNews.covers.map((_, index) => `
                                <div class="pagination-dot ${index === 0 ? 'active' : ''}" 
                                     data-index="${index}"></div>
                            `).join('')}
                        </div>
                    </div>
            </div>
            <div class="last-new-content">
                <p class="date">${latestNews.date}</p>
                <h3>${latestNews.title}</h3>
                <div class="news-text-container ${isLongText ? 'has-more' : ''}">
                    <p class="text">${isLongText ? latestNews.text.substring(0, 300) + '...' : latestNews.text}</p>
                </div>
                <div class="news-buttons-container">
                    ${isLongText ? `
                        <button class="read-more-btn">
                            <span>Читать</span>
                            <i class="fas fa-eye"></i>
                        </button>
                    ` : ''}
                    <div class="card-action btn" onclick="window.location.href='news.html'">
                        <span>Все новости</span>
                        <i class="fas fa-arrow-right"></i>
                    </div>
                </div>
            </div>
            `;

            // Обработчик клика для кнопки "Читать полностью"
            const readMoreBtn = lastNewsContainer.querySelector('.read-more-btn');
            if (readMoreBtn) {
            readMoreBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                openNewsModal();
            });
            }

            // Остальной код инициализации...
            initGalleryControls();
            
            // Обработчик клика по новости (но не по галерее или кнопкам)
            lastNewsContainer.addEventListener('click', function(e) {
                if (!e.target.closest('.card-action') && 
                    !e.target.closest('.read-more-btn') && 
                    !e.target.closest('.gallery-controls')) {
                    openNewsModal();
                }
            });
        })
        .catch(error => console.error('Ошибка загрузки новостей:', error));
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    loadLatestNews();
    
    // Закрытие модального окна при клике вне контента
    const modal = document.getElementById('newsModal');
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeNewsModal();
        }
    });
    
    // Закрытие модального окна при нажатии ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeNewsModal();
        }
    });
});

// Глобальные функции
window.setNewsImage = setNewsImage;
window.closeNewsModal = closeNewsModal;