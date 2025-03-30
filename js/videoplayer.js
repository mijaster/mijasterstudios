function initVideoPlayers() {
    const videoPlayers = document.querySelectorAll('.video-player');

    videoPlayers.forEach(videoPlayer => {
        const videoElement = videoPlayer.querySelector('video');
        const pausePreview = videoPlayer.querySelector('.pause-preview');
        const pauseIcon = videoPlayer.querySelector('.pause-icon'); // Иконка паузы
        const playPauseBtn = videoPlayer.querySelector('.play-pause-btn');
        const progressSlider = videoPlayer.querySelector('.progress-slider');
        const timeDisplay = videoPlayer.querySelector('.time-display');
        const volumeSlider = videoPlayer.querySelector('.volume-slider');
        const volumeIcon = videoPlayer.querySelector('.volume-icon');
        const fullscreenBtn = videoPlayer.querySelector('.fullscreen-btn');

        // Функция для обновления отображения времени
        function updateTimeDisplay() {
            const currentTime = formatTime(videoElement.currentTime);
            const duration = formatTime(videoElement.duration);
            timeDisplay.textContent = `${currentTime} / ${duration}`;
        }

        // Форматирование времени в формат "минуты:секунды"
        function formatTime(time) {
            if (isNaN(time)) return '0:00'; // Защита от NaN
            const minutes = Math.floor(time / 60);
            const seconds = Math.floor(time % 60).toString().padStart(2, '0');
            return `${minutes}:${seconds}`;
        }

        // Ожидаем загрузки метаданных перед отображением времени
        videoElement.addEventListener('loadedmetadata', () => {
            updateTimeDisplay(); // Инициализация отображения времени после загрузки метаданных
        });

        // Показ превью и иконки паузы при паузе
        videoElement.addEventListener('pause', () => {
            pausePreview.classList.add('visible'); // Показываем превью
            pauseIcon.classList.add('visible'); // Показываем иконку паузы
        });

        // Скрываем превью и иконку паузы при воспроизведении
        videoElement.addEventListener('play', () => {
            pausePreview.classList.remove('visible'); // Скрываем превью
            pauseIcon.classList.remove('visible'); // Скрываем иконку паузы

            // Остановка всех других видео
            videoPlayers.forEach(otherPlayer => {
                const otherVideo = otherPlayer.querySelector('video');
                if (otherVideo !== videoElement && !otherVideo.paused) {
                    otherVideo.pause();
                    const otherPlayPauseBtn = otherPlayer.querySelector('.play-pause-btn i');
                    otherPlayPauseBtn.classList.remove('fa-pause');
                    otherPlayPauseBtn.classList.add('fa-play');
                }
            });
        });

        // Управление воспроизведением/паузой
        playPauseBtn.addEventListener('click', () => {
            if (videoElement.paused) {
                videoElement.play();
                playPauseBtn.querySelector('i').classList.remove('fa-play');
                playPauseBtn.querySelector('i').classList.add('fa-pause');
            } else {
                videoElement.pause();
                playPauseBtn.querySelector('i').classList.remove('fa-pause');
                playPauseBtn.querySelector('i').classList.add('fa-play');
            }
        });

        // Обновление ползунка прогресса
        videoElement.addEventListener('timeupdate', () => {
            const percentage = (videoElement.currentTime / videoElement.duration) * 100;
            progressSlider.value = percentage;
            updateTimeDisplay();
        });

        // Перемотка видео по ползунку прогресса
        progressSlider.addEventListener('input', () => {
            const time = (progressSlider.value / 100) * videoElement.duration;
            videoElement.currentTime = time;
        });

        // Управление громкостью
        volumeSlider.addEventListener('input', () => {
            videoElement.volume = volumeSlider.value / 100;
            if (videoElement.volume === 0) {
                volumeIcon.classList.remove('fa-volume-up');
                volumeIcon.classList.add('fa-volume-off');
            } else {
                volumeIcon.classList.remove('fa-volume-off');
                volumeIcon.classList.add('fa-volume-up');
            }
        });

        // Полноэкранный режим
        fullscreenBtn.addEventListener('click', () => {
            if (videoElement.requestFullscreen) {
                videoElement.requestFullscreen();
            } else if (videoElement.mozRequestFullScreen) {
                videoElement.mozRequestFullScreen(); // Firefox
            } else if (videoElement.webkitRequestFullscreen) {
                videoElement.webkitRequestFullscreen(); // Chrome, Safari and Opera
            } else if (videoElement.msRequestFullscreen) {
                videoElement.msRequestFullscreen(); // IE/Edge
            }
        });

        // Инициализация отображения времени
        updateTimeDisplay();
    });
}
