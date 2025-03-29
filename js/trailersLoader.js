document.addEventListener('DOMContentLoaded', function() {
    // Проверяем, существует ли контейнер для видео
    const container = document.getElementById('videos-container');
    if (!container) {
        console.error('Контейнер для видео не найден!');
        return;
    }

    // Загружаем JSON данные
    fetch('json/trailers_data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Проверяем, есть ли данные в JSON
            if (!data || Object.keys(data).length === 0) {
                console.warn('JSON файл пуст или не содержит данных');
                container.innerHTML = '<p>Трейлеры не найдены</p>';
                return;
            }

            // Очищаем контейнер перед добавлением новых элементов
            container.innerHTML = '';

            // Для каждого элемента в JSON создаем видео-плеер
            for (const [videoId, videoData] of Object.entries(data)) {
                // Проверяем наличие обязательных полей
                if (!videoData.preview || !videoData.name) {
                    console.warn(`У видео ${videoId} отсутствуют необходимые данные`, videoData);
                    continue;
                }

                const videoElement = document.createElement('div');
                videoElement.className = 'video-player';
                videoElement.dataset.videoId = videoId;
                
                videoElement.innerHTML = `
                    <div class="video-info-overlay">
                        <p class="video-title">${videoData.name}</p>
                    </div>
                    <div class="pause-preview"></div>
                    <video class="video" poster="imgs/posters/${videoData.preview}.png">
                        <source src="videos/trailers/${videoId}.mp4" type="video/mp4">
                        Ваш браузер не поддерживает видео.
                    </video>
                    <a href="#" class="more-info-btn">об игре</a>
                    <div class="custom-controls">
                        <a href="#" class="play-pause-btn control-btn"><i class="fas fa-play"></i></a>
                        <input type="range" class="progress-slider" min="0" max="100" value="0">
                        <i class="fas fa-volume-up volume-icon"></i>
                        <input type="range" class="volume-slider" min="0" max="1" step="0.01" value="1">
                        <a href="#" class="fullscreen-btn control-btn"><i class="fas fa-expand"></i></a>
                    </div>
                `;
                container.appendChild(videoElement);
            }


            if (typeof initVideoPlayers === 'function') {
                initVideoPlayers();
            } else {
                console.warn('Функция initVideoPlayers не найдена. Убедитесь, что videoplayer.js подключен правильно.');
            }
        })
        .catch(error => {
            console.error('Ошибка загрузки трейлеров:', error);
            container.innerHTML = `<p class="error-message">Произошла ошибка при загрузке трейлеров: ${error.message}</p>`;
        });
});