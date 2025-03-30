document.addEventListener('DOMContentLoaded', function () {
    fetch('json/trailers_data.json')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('videos-container');
            const videos = Object.entries(data);

            videos.forEach(([id, videoData], index) => {
                const videoPlayer = document.createElement('div');
                videoPlayer.className = 'video-player fade-in-up';
                videoPlayer.style.animationDelay = `${index * 0.2}s`; // Задержка для каждого видео
                videoPlayer.innerHTML = `
                    <!-- Превью видео -->
                    <div class="pause-preview" style="background-image: url('imgs/previews/${videoData.preview}.png');"></div>
                    
                    <!-- Иконка паузы -->
                    <div class="pause-icon"><i class="fas fa-play"></i></div>
                    
                    <!-- Видео -->
                    <video id="${id}" preload="metadata" poster="imgs/previews/${videoData.preview}.png">
                        <source src="videos/trailers/${id}.mp4" type="video/mp4">
                    </video>
                    
                    <!-- Информация о видео -->
                    <div class="video-info-overlay">
                        <h3 class="video-title">${videoData.name}</h3>
                    </div>
                    
                    <!-- Кнопка "Подробнее" -->
                    <a href="#" class="more-info-btn">об игре</a>
                    
                    <!-- Пользовательские контролы -->
                    <div class="custom-controls">
                        <button class="control-btn play-pause-btn"><i class="fas fa-play"></i></button>
                        <input type="range" class="progress-slider" value="0" min="0" max="100">
                        <span class="time-display">0:00 / 0:00</span>
                        <div class="volume-controls">
                            <i class="fas fa-volume-up volume-icon"></i>
                            <input type="range" class="volume-slider" value="100" min="0" max="100">
                        </div>
                        <button class="control-btn fullscreen-btn"><i class="fas fa-expand"></i></button>
                    </div>
                `;
                container.appendChild(videoPlayer);
            });

            // Инициализируем видеоплееры после загрузки
            initVideoPlayers();
        })
        .catch(error => console.error('Error loading videos:', error));
});