document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('gameId');
    
    if (!gameId) {
        console.error("Game ID не указан в URL");
        return;
    }

    const configUrl = "json/games_config.json";
    const tagsConfigUrl = "json/tags_config.json";

    Promise.all([
        fetch(configUrl).then(response => {
            if (!response.ok) throw new Error(`Ошибка загрузки конфига: ${response.status}`);
            return response.json();
        }),
        fetch(tagsConfigUrl).then(response => {
            if (!response.ok) throw new Error(`Ошибка загрузки конфига тегов: ${response.status}`);
            return response.json();
        })
    ])
    .then(([gamesConfig, tagsConfig]) => {
        const gameData = gamesConfig[gameId];
        if (!gameData) {
            console.error(`Игра с ID "${gameId}" не найдена в конфиге.`);
            return;
        }

        populateGamePage(gameData, gameId, tagsConfig);
    })
    .catch(error => {
        console.error("Ошибка при загрузке конфигов:", error);
    });
});

function populateGamePage(gameData, gameId, tagsConfig) {
    document.title = `${gameData.name} - MIJASTER`;

    document.querySelector(".name").textContent = gameData.name || "Название не указано";
    document.querySelector(".date").textContent = `Дата: ${gameData.date || "Не объявлена"}`;
    document.querySelector(".dev").textContent = `Разработчик: ${gameData.dev || "Не указан"}`;
    document.querySelector(".version").textContent = `Версия: ${gameData.version || "Не указана"}`;
    document.querySelector(".description").textContent = gameData.description || "Описание отсутствует";

    // Обработка тегов
    const tagsContainer = document.querySelector(".tags");
    if (gameData.tags && Array.isArray(gameData.tags) && gameData.tags.length > 0) {
        tagsContainer.innerHTML = ""; // Очищаем контейнер
        
        gameData.tags.forEach(tagId => {
            const tagInfo = tagsConfig[tagId];
            if (tagInfo) {
                const tagElement = document.createElement("li");
                tagElement.innerHTML = `<i class="fas fa-${tagInfo.icon}"></i><p>${tagInfo.name}</p>`;
                tagsContainer.appendChild(tagElement);
            }
        });
    } else {
        // Если тегов нет или они не в массиве, удаляем контейнер
        tagsContainer.remove();
    }

    const posterPath = gameData.poster ? `games/${gameId}/${gameData.poster}` : "";
    document.querySelector(".poster").src = posterPath;

    analyzePosterColors(posterPath);

    const notesElement = document.querySelector(".notes");
    if (gameData.notes) {
        notesElement.textContent = gameData.notes;
    } else {
        notesElement.style.display = "none";
    }

    const downloadBtn = document.querySelector(".download-btn");
    const notAvailableMsg = document.querySelector(".not-available-msg");
    
    if (gameData.downloadable === true) {
        downloadBtn.style.display = "inline-block";
        notAvailableMsg.style.display = "none";
        
        if (gameData.download_link) {
            downloadBtn.href = gameData.download_link;
        }
    } else {
        downloadBtn.style.display = "none";
        notAvailableMsg.style.display = "block";
    }

    if (gameData.trailer) {
        const trailerPreviewPath = `games/${gameId}/previews/${gameData.trailer.preview}`;
        const trailerVideoPath = `games/${gameId}/trailers/${gameData.trailer.video}`;
        const videoPlayer = document.querySelector(".video-player");
        if (videoPlayer) {
            const videoElement = videoPlayer.querySelector("video");
            videoElement.setAttribute("poster", trailerPreviewPath);
            videoPlayer.querySelector("source").src = trailerVideoPath;
            videoPlayer.querySelector(".video-title").textContent = gameData.trailer.name;
    
            videoElement.load();
    
            const progressBar = document.querySelector(".progress-bar");
            if (progressBar) {
                progressBar.value = 0;
            }
        }
    } else {
        const videoPlayer = document.querySelector(".video-player");
        if (videoPlayer) videoPlayer.remove();
    }

    if (gameData.screens_folder) {
        const screensContainer = document.querySelector(".screens-container");
        const screensDiv = document.querySelector(".screens");
        const indicatorsDiv = document.querySelector(".indicators");

        if (!screensContainer || !screensDiv || !indicatorsDiv) {
            return;
        }

        screensDiv.innerHTML = "";
        indicatorsDiv.innerHTML = "";

        const screensFolderPath = `games/${gameId}/${gameData.screens_folder}/`;

        let loadedScreensCount = 0;
        const promises = [];

        for (let i = 1; i <= 15; i++) {
            const screenPath = `${screensFolderPath}${i}.png`;

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
                    }
                });

            promises.push(promise);
        }

        Promise.all(promises).then(() => {
            if (loadedScreensCount > 0) {
                initializeSlider();
            } else {
                screensContainer.remove();
            }
        });
    } else {
        const screensContainer = document.querySelector(".screens-container");
        if (screensContainer) screensContainer.remove();
    }
}

function analyzePosterColors(imgPath) {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imgPath;

    img.onload = () => {
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

        function getLuminance(r, g, b) {
            return 0.299 * r + 0.587 * g + 0.114 * b;
        }

        const thresholdColor = { r: 26, g: 29, b: 36 };
        const thresholdLuminance = getLuminance(thresholdColor.r, thresholdColor.g, thresholdColor.b);
        const avgLuminance = getLuminance(avgR, avgG, avgB);

        const finalColor = avgLuminance > thresholdLuminance ? thresholdColor : { r: avgR, g: avgG, b: avgB };

        const gameContainer = document.querySelector(".image-bg");
        if (gameContainer) {
            const alpha = 0.7;
            const finalColorWithAlpha = `rgba(${finalColor.r}, ${finalColor.g}, ${finalColor.b}, ${alpha})`;
            gameContainer.style.backgroundColor = finalColorWithAlpha;
        }

        const darkenFactor = 0.8;
        const darkenedR = Math.round(finalColor.r * darkenFactor);
        const darkenedG = Math.round(finalColor.g * darkenFactor);
        const darkenedB = Math.round(finalColor.b * darkenFactor);

        const darkenedColor = `rgb(${darkenedR}, ${darkenedG}, ${darkenedB})`;

        const imageGlobalBg = document.querySelector(".image-global-bg");
        const imageBtnBg = document.querySelector(".btn");
        const imageFooterBg = document.querySelector(".footer-bg");
        if (imageGlobalBg) {
            imageGlobalBg.style.backgroundColor = darkenedColor;
        }
        if (imageBtnBg) {
            imageBtnBg.style.backgroundColor = darkenedColor;
        }
        if (imageFooterBg) {
            imageFooterBg.style.backgroundColor = darkenedColor;
        }
    };
}

class ImageSlider {
    constructor() {
        this.slides = document.querySelectorAll('.screen');
        this.indicators = document.querySelectorAll('.indicator');
        this.currentIndex = 0;
        this.animationDuration = 800;
        this.autoSlideInterval = null;
        
        this.init();
    }
    
    init() {
        if (this.slides.length > 0) {
            this.slides[0].classList.add('active');
        }
        
        const leftArrow = document.querySelector('.left-arrow');
        const rightArrow = document.querySelector('.right-arrow');
        
        if (leftArrow) leftArrow.addEventListener('click', () => this.prev());
        if (rightArrow) rightArrow.addEventListener('click', () => this.next());
        
        this.indicators.forEach(indicator => {
            indicator.addEventListener('click', () => {
                const index = parseInt(indicator.dataset.index);
                this.goTo(index);
            });
        });
        
        this.startAutoSlide();
        
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
        
        currentSlide.classList.remove('active');
        nextSlide.classList.add('active');
        
        this.currentIndex = index;
        
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

function initializeSlider() {
    new ImageSlider();
}