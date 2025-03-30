document.addEventListener("DOMContentLoaded", () => {
    // Получаем gameId из параметров URL
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('gameId');
    
    if (!gameId) {
        console.error("Game ID не указан в URL");
        return;
    }

    const configUrl = "json/games_config.json";

    fetch(configUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Ошибка загрузки конфига: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const gameData = data[gameId];
            if (!gameData) {
                console.error(`Игра с ID "${gameId}" не найдена в конфиге.`);
                return;
            }

            populateGamePage(gameData, gameId);
        })
        .catch(error => {
            console.error("Ошибка при загрузке конфига:", error);
        });
});

// Остальные функции (populateGamePage, analyzePosterColors, ImageSlider, initializeSlider) 
// остаются без изменений, как в вашем исходном коде

function populateGamePage(gameData, gameId) {
    console.log("Загруженные данные игры:", gameData);

    // Обновление заголовка страницы
    document.title = `${gameData.name} - MIJASTER`;

    // Заполнение основной информации об игре
    document.querySelector(".name").textContent = gameData.name || "Название не указано";
    document.querySelector(".date").textContent = `Дата: ${gameData.date || "Не указана"}`;
    document.querySelector(".dev").textContent = `Разработчик: ${gameData.dev || "Не указан"}`;
    document.querySelector(".description").textContent = gameData.description || "Описание отсутствует";

    // Установка постера
    const posterPath = gameData.poster ? `games/${gameId}/${gameData.poster}` : "imgs/header_banners/lc_1.png";
    console.log("Путь к постеру:", posterPath);
    document.querySelector(".poster").src = posterPath;

    // Анализ цветов фона на основе постера
    analyzePosterColors(posterPath);

    // Проверка и добавление главного трейлера
    if (gameData.trailer) {
        const trailerPreviewPath = `games/${gameId}/previews/${gameData.trailer.preview}`;
        const trailerVideoPath = `games/${gameId}/trailers/${gameData.trailer.video}`;

        console.log("Путь к превью трейлера:", trailerPreviewPath);
        console.log("Путь к видео трейлера:", trailerVideoPath);

        const videoPlayer = document.querySelector(".video-player");
        if (videoPlayer) {
            videoPlayer.querySelector(".pause-preview").style.backgroundImage = `url('${trailerPreviewPath}')`;
            const videoElement = videoPlayer.querySelector("video");
            videoElement.setAttribute("poster", trailerPreviewPath);
            videoPlayer.querySelector("source").src = trailerVideoPath;
            videoPlayer.querySelector(".video-title").textContent = gameData.trailer.name;

            // Перезагрузка видео для обновления источника
            videoElement.load();
        }
    } else {
        const videoPlayer = document.querySelector(".video-player");
        if (videoPlayer) videoPlayer.remove();
    }

    // Проверка и добавление скриншотов
    if (gameData.screens_folder) {
        const screensContainer = document.querySelector(".screens-container");
        const screensDiv = document.querySelector(".screens");
        const indicatorsDiv = document.querySelector(".indicators");

        if (!screensContainer || !screensDiv || !indicatorsDiv) {
            console.warn("Не найдены элементы для отображения скриншотов");
            return;
        }

        screensDiv.innerHTML = ""; // Очищаем существующие скриншоты
        indicatorsDiv.innerHTML = ""; // Очищаем индикаторы

        const screensFolderPath = `games/${gameId}/${gameData.screens_folder}/`;
        console.log("Путь к скриншотам:", screensFolderPath);

        let loadedScreensCount = 0; // Счетчик загруженных скриншотов
        const promises = [];

        for (let i = 1; i <= 15; i++) { // Предполагаем до 5 скриншотов
            const screenPath = `${screensFolderPath}${i}.png`;
            console.log(`Проверяем скриншот: ${screenPath}`);

            const promise = fetch(screenPath)
                .then(response => {
                    if (response.ok) {
                        const img = document.createElement("img");
                        img.src = screenPath;
                        img.alt = `screen ${i}`;
                        img.classList.add("screen");
                        if (i === 1) img.classList.add("active");
                        screensDiv.appendChild(img);

                        const indicator = document.createElement("span");
                        indicator.classList.add("indicator");
                        if (i === 1) indicator.classList.add("active");
                        indicator.setAttribute("data-index", i - 1);
                        indicatorsDiv.appendChild(indicator);

                        loadedScreensCount++;
                    } else {
                        console.warn(`Скриншот ${screenPath} не найден.`);
                    }
                })
                .catch(() => {
                    console.warn(`Ошибка при загрузке скриншота: ${screenPath}`);
                });

            promises.push(promise);
        }

        // Когда все промисы завершатся, инициализируем слайдер
        Promise.all(promises).then(() => {
            if (loadedScreensCount > 0) {
                initializeSlider();
            } else {
                console.warn("Не удалось загрузить ни одного скриншота");
                screensContainer.remove();
            }
        });
    } else {
        console.warn("Папка со скриншотами не указана.");
        const screensContainer = document.querySelector(".screens-container");
        if (screensContainer) screensContainer.remove();
    }
}

function analyzePosterColors(imgPath) {
    console.log("Загрузка изображения для анализа цветов:", imgPath);

    const img = new Image();
    img.crossOrigin = "Anonymous"; // Для работы с изображениями с других доменов
    img.src = imgPath;

    img.onload = () => {
        console.log("Изображение успешно загружено");

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

        let totalR = 0, totalG = 0, totalB = 0;
        const pixelCount = imageData.length / 4;

        for (let i = 0; i < imageData.length; i += 4) {
            totalR += imageData[i];
            totalG += imageData[i + 1];
            totalB += imageData[i + 2];
        }

        const avgR = Math.round(totalR / pixelCount);
        const avgG = Math.round(totalG / pixelCount);
        const avgB = Math.round(totalB / pixelCount);

        // Функция для вычисления яркости цвета
        function getLuminance(r, g, b) {
            return 0.299 * r + 0.587 * g + 0.114 * b;
        }

        // Пороговый цвет
        const thresholdColor = { r: 26, g: 29, b: 36 }; // #1A1D24
        const thresholdLuminance = getLuminance(thresholdColor.r, thresholdColor.g, thresholdColor.b);

        // Яркость среднего цвета
        const avgLuminance = getLuminance(avgR, avgG, avgB);

        // Если средний цвет светлее порогового, используем пороговый
        const finalColor = avgLuminance > thresholdLuminance ? thresholdColor : { r: avgR, g: avgG, b: avgB };

        // Устанавливаем фон для game-container
        const gameContainer = document.querySelector(".image-bg");
        if (gameContainer) {
            const alpha = 0.7;
            const finalColorWithAlpha = `rgba(${finalColor.r}, ${finalColor.g}, ${finalColor.b}, ${alpha})`;
            gameContainer.style.backgroundColor = finalColorWithAlpha;
            console.log("Цвет для .image-bg установлен:", finalColorWithAlpha);
        } else {
            console.warn("Элемент .image-bg не найден.");
        }

        // Вычисляем темный цвет для .image-global-bg
        const darkenFactor = 0.8; // На 20% темнее
        const darkenedR = Math.round(finalColor.r * darkenFactor);
        const darkenedG = Math.round(finalColor.g * darkenFactor);
        const darkenedB = Math.round(finalColor.b * darkenFactor);

        const darkenedColor = `rgb(${darkenedR}, ${darkenedG}, ${darkenedB})`;

        console.log("Темный цвет для .image-global-bg:", darkenedColor);

        // Применяем темный цвет к .image-global-bg
        const imageGlobalBg = document.querySelector(".image-global-bg");
        if (imageGlobalBg) {
            imageGlobalBg.style.backgroundColor = darkenedColor;
            console.log("Цвет для .image-global-bg установлен:", darkenedColor);
        } else {
            console.warn("Элемент .image-global-bg не найден.");
        }
    };

    img.onerror = () => {
        console.error("Ошибка загрузки изображения.");
    };
}

// Класс слайдера
class ImageSlider {
    constructor() {
        this.slides = document.querySelectorAll('.screen');
        this.indicators = document.querySelectorAll('.indicator');
        this.currentIndex = 0;
        this.animationDuration = 800; // Должно совпадать с CSS
        this.autoSlideInterval = null;
        
        this.init();
    }
    
    init() {
        // Показываем первый слайд
        if (this.slides.length > 0) {
            this.slides[0].classList.add('active');
        }
        
        // Назначаем обработчики для стрелок
        const leftArrow = document.querySelector('.left-arrow');
        const rightArrow = document.querySelector('.right-arrow');
        
        if (leftArrow) leftArrow.addEventListener('click', () => this.prev());
        if (rightArrow) rightArrow.addEventListener('click', () => this.next());
        
        // Назначаем обработчики для индикаторов
        this.indicators.forEach(indicator => {
            indicator.addEventListener('click', () => {
                const index = parseInt(indicator.dataset.index);
                this.goTo(index);
            });
        });
        
        // Автопереключение
        this.startAutoSlide();
        
        // Пауза при наведении
        const screensContainer = document.querySelector('.screens-container');
        if (screensContainer) {
            screensContainer.addEventListener('mouseenter', () => {
                this.stopAutoSlide();
            });
            
            screensContainer.addEventListener('mouseleave', () => {
                this.startAutoSlide();
            });
        }
    }
    
    goTo(index) {
        if (index === this.currentIndex || index < 0 || index >= this.slides.length) return;
        
        const currentSlide = this.slides[this.currentIndex];
        const nextSlide = this.slides[index];
        
        // Начинаем анимацию
        currentSlide.classList.remove('active');
        nextSlide.classList.add('active');
        
        // Обновляем текущий индекс
        this.currentIndex = index;
        
        // Обновляем индикаторы
        this.updateIndicators();
    }
    
    updateIndicators() {
        this.indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === this.currentIndex);
        });
    }
    
    next() {
        const nextIndex = (this.currentIndex + 1) % this.slides.length;
        this.goTo(nextIndex);
    }
    
    prev() {
        const prevIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
        this.goTo(prevIndex);
    }
    
    startAutoSlide() {
        this.stopAutoSlide();
        if (this.slides.length > 1) {
            this.autoSlideInterval = setInterval(() => this.next(), 5000);
        }
    }
    
    stopAutoSlide() {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
        }
    }
}

// Функция для инициализации слайдера
function initializeSlider() {
    console.log("Инициализация слайдера...");
    new ImageSlider();
}