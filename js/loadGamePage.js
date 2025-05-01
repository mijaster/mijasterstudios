document.addEventListener("DOMContentLoaded", () => {
    const elements = {
        name: document.querySelector(".name"),
        date: document.querySelector(".date"),
        dev: document.querySelector(".dev"),
        version: document.querySelector(".version"),
        description: document.querySelector(".description"),
        tags: document.querySelector(".tags"),
        posterContainer: document.querySelector(".poster-container"),
        notes: document.querySelector(".notes"),
        downloadBtn: document.querySelector(".download-btn"),
        notAvailableMsg: document.querySelector(".not-available-msg"),
        videoPlayer: document.querySelector(".video-player"),
        screensContainer: document.querySelector(".screens-container")
    };

    const initAnimations = () => {
        const scrollAnimateElements = document.querySelectorAll(
            '.about-game, .notes, .download-actions, .video-player, .screens-container'
        );
        scrollAnimateElements.forEach(el => el.classList.add('scroll-animate'));
        const animateOnScroll = () => {
            document.querySelectorAll('.scroll-animate, .description').forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight - 100) {
                    el.classList.add('animated');
                }
            });
        };
        window.addEventListener('scroll', animateOnScroll);
        animateOnScroll();
    };

    const loadGameData = async () => {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const gameId = urlParams.get('gameId');
            if (!gameId) throw new Error("Game ID не указан в URL");
            const [gamesConfig, tagsConfig, devsConfig] = await Promise.all([
                fetch("json/games_config.json").then(res => res.json()),
                fetch("json/tags_config.json").then(res => res.json()),
                fetch("json/devs_config.json").then(res => res.json())
            ]);
            const gameData = gamesConfig[gameId];
            if (!gameData) throw new Error(`Игра с ID "${gameId}" не найдена`);
            await populateGamePage(gameData, gameId, tagsConfig, devsConfig);
        } catch (error) {
            console.error("Ошибка загрузки данных:", error);
        }
    };

    const populateGamePage = async (gameData, gameId, tagsConfig, devsConfig) => {
        document.title = `${gameData.name} - MIJASTER`;
        elements.name.textContent = gameData.name || "Название не указано";
        elements.date.textContent = `Дата: ${gameData.date || "Не объявлена"}`;

        // Разработчики
        if (gameData.dev && gameData.dev.length > 0) {
            const devsHTML = gameData.dev.map(devId => {
                const devInfo = devsConfig[devId];
                return devInfo 
                    ? `<span class="dev-item"><img src="${devInfo.logo}" alt="" class="dev-logo"><span class="dev-name">${devInfo.name}</span></span>` 
                    : devId;
            }).join(', ');
            elements.dev.innerHTML = `Разработчик: ${devsHTML}`;
        } else {
            elements.dev.textContent = `Разработчик: Не указан`;
        }

        elements.version.textContent = `Версия: ${gameData.version || "Не указана"}`;
        elements.description.innerHTML = gameData.description || "Описание отсутствует";

        // Теги
        if (gameData.tags?.length > 0) {
            elements.tags.innerHTML = gameData.tags.map(tagId => {
                const tag = tagsConfig[tagId];
                return tag 
                    ? `<li><i class="fas fa-${tag.icon}"></i><p>${tag.name}</p></li>` 
                    : '';
            }).join('');
        } else {
            elements.tags.remove();
        }

        // Постер
        if (gameData.poster) {
            const posterPath = `games/${gameId}/${gameData.poster}`;
            const posterExt = gameData.poster.split('.').pop().toLowerCase();
            if (['mp4', 'webm', 'ogg'].includes(posterExt)) {
                await createVideoPoster(posterPath);
                await analyzeVideoPosterColors(posterPath);
            } else {
                createImagePoster(posterPath);
                analyzePosterColors(posterPath);
            }
        }

        // Заметки
        if (gameData.notes) {
            elements.notes.textContent = gameData.notes;
        } else {
            elements.notes.style.display = "none";
        }

        // Кнопка скачивания
        if (gameData.downloadable) {
            elements.notAvailableMsg.style.display = "none";
            if (gameData.download_link) {
                elements.downloadBtn.href = gameData.download_link;
            }
        } else {
            elements.downloadBtn.style.display = "none";
            elements.notAvailableMsg.style.display = "block";
        }

        // Видео
        if (gameData["trailers-page"] && gameData.trailer) {
            const trailerData = gameData["trailers-page"][gameData.trailer];
            if (trailerData) {
                const video = elements.videoPlayer.querySelector("video");
                video.poster = `games/${gameId}/previews/${trailerData.preview}`;
                video.querySelector("source").src = `games/${gameId}/trailers/${trailerData.video}`;
                video.load();
                elements.videoPlayer.querySelector(".video-title").textContent = trailerData.name || "";
            } else {
                elements.videoPlayer.remove();
            }
        } else {
            elements.videoPlayer.remove();
        }

        // Скриншоты
        if (gameData.screens_folder) {
            loadScreenshots(gameId, gameData.screens_folder);
        } else {
            elements.screensContainer.remove();
        }
    };

    const createVideoPoster = (src) => {
        return new Promise((resolve) => {
            elements.posterContainer.innerHTML = '';
            const video = document.createElement('video');
            video.src = src;
            video.autoplay = true;
            video.loop = true;
            video.muted = true;
            video.playsInline = true;
            video.controls = false;
            video.disablePictureInPicture = true;
            video.disableRemotePlayback = true;
            elements.posterContainer.appendChild(video);
            video.play().catch(e => console.log('Автовоспроизведение не сработало:', e));
            video.addEventListener('canplay', () => resolve());
        });
    };

    const createImagePoster = (src) => {
        elements.posterContainer.innerHTML = '';
        const img = document.createElement('img');
        img.src = src;
        img.alt = 'Game poster';
        elements.posterContainer.appendChild(img);
    };

    const analyzeVideoPosterColors = (videoPath) => {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.src = videoPath;
            video.crossOrigin = "Anonymous";
            video.muted = true;
            video.currentTime = 0.1;
            video.addEventListener('seeked', function() {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                let r = 0, g = 0, b = 0;
                for (let i = 0; i < imageData.length; i += 4) {
                    r += imageData[i];
                    g += imageData[i+1];
                    b += imageData[i+2];
                }
                r = Math.round(r / (imageData.length / 4));
                g = Math.round(g / (imageData.length / 4));
                b = Math.round(b / (imageData.length / 4));
                const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
                const isLight = luminance > (0.299 * 26 + 0.587 * 29 + 0.114 * 36);
                const bgColor = isLight ? 
                    { r: 13, g: 13, b: 14 } : { r, g, b };
                const darkened = `rgb(${Math.round(bgColor.r * 0.8)}, ${Math.round(bgColor.g * 0.8)}, ${Math.round(bgColor.b * 0.8)})`;
                document.querySelector(".image-bg").style.backgroundColor = `rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, 0.7)`;
                document.querySelector(".image-global-bg").style.backgroundColor = darkened;
                document.querySelector(".footer-bg").style.backgroundColor = darkened;
                document.querySelector(".btn").style.backgroundColor = darkened;
                resolve();
            });
            video.addEventListener('error', () => {
                console.error('Ошибка загрузки видео');
                resolve();
            });
            video.load();
        });
    };

    const analyzePosterColors = (imgPath) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = function() {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            let r = 0, g = 0, b = 0;
            for (let i = 0; i < imageData.length; i += 4) {
                r += imageData[i];
                g += imageData[i+1];
                b += imageData[i+2];
            }
            r = Math.round(r / (imageData.length / 4));
            g = Math.round(g / (imageData.length / 4));
            b = Math.round(b / (imageData.length / 4));
            const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
            const isLight = luminance > (0.299 * 26 + 0.587 * 29 + 0.114 * 36);
            const bgColor = isLight ? 
                { r: 13, g: 13, b: 14 } : { r, g, b };
            const darkened = `rgb(${Math.round(bgColor.r * 0.8)}, ${Math.round(bgColor.g * 0.8)}, ${Math.round(bgColor.b * 0.8)})`;
            document.querySelector(".image-bg").style.backgroundColor = `rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, 0.7)`;
            document.querySelector(".image-global-bg").style.backgroundColor = darkened;
            document.querySelector(".footer-bg").style.backgroundColor = darkened;
            document.querySelector(".btn").style.backgroundColor = darkened;
        };
        img.src = imgPath;
    };

    const loadScreenshots = async (gameId, folder) => {
        const screensDiv = elements.screensContainer.querySelector(".screens");
        const indicatorsDiv = elements.screensContainer.querySelector(".indicators");
        screensDiv.innerHTML = "";
        indicatorsDiv.innerHTML = "";
        const screens = [];
        const basePath = `games/${gameId}/${folder}/`;

        for (let i = 1; i <= 25; i++) {
            const img = new Image();
            const imgPath = `${basePath}${i}.png`;
            try {
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                    img.src = imgPath;
                });
                screens.push({
                    path: imgPath,
                    index: screens.length
                });
            } catch {
                // Пропускаем несуществующие изображения
            }
        }

        if (screens.length === 0) {
            elements.screensContainer.remove();
            return;
        }

        screens.forEach((screen, idx) => {
            const img = document.createElement("img");
            img.src = screen.path;
            img.alt = `screen ${idx + 1}`;
            img.classList.add("screen");
            screensDiv.appendChild(img);
            const indicator = document.createElement("span");
            indicator.classList.add("indicator");
            indicator.dataset.index = idx;
            indicatorsDiv.appendChild(indicator);
        });

        new Slider(
            screensDiv.querySelectorAll(".screen"),
            indicatorsDiv.querySelectorAll(".indicator")
        );
    };

    class Slider {
        constructor(slides, indicators) {
            this.slides = slides;
            this.indicators = indicators;
            this.currentIndex = 0;
            this.interval = null;
            this.init();
        }

        init() {
            if (this.slides.length === 0) return;
            this.showSlide(0);
            document.querySelector(".left-arrow").addEventListener("click", () => this.prev());
            document.querySelector(".right-arrow").addEventListener("click", () => this.next());
            this.indicators.forEach((indicator, idx) => {
                indicator.addEventListener("click", () => this.goTo(idx));
            });
            this.startAutoSlide();
            elements.screensContainer.addEventListener("mouseenter", () => this.stopAutoSlide());
            elements.screensContainer.addEventListener("mouseleave", () => this.startAutoSlide());
        }

        showSlide(index) {
            this.slides.forEach(slide => slide.classList.remove("active"));
            this.indicators.forEach(ind => ind.classList.remove("active"));
            this.slides[index]?.classList.add("active");
            this.indicators[index]?.classList.add("active");
            this.currentIndex = index;
        }

        goTo(index) {
            if (index < 0 || index >= this.slides.length || index === this.currentIndex) return;
            this.showSlide(index);
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
                this.interval = setInterval(() => this.next(), 3500);
            }
        }

        stopAutoSlide() {
            if (this.interval) {
                clearInterval(this.interval);
                this.interval = null;
            }
        }
    }

    initAnimations();
    loadGameData();
});