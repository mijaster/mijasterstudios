document.addEventListener('DOMContentLoaded', () => {
    const videoPlayers = document.querySelectorAll('.video-player');
    let currentlyPlayingVideo = null;

    videoPlayers.forEach(player => {
        const video = player.querySelector('.video');
        const playPauseBtn = player.querySelector('.play-pause-btn');
        const progressSlider = player.querySelector('.progress-slider');
        const volumeSlider = player.querySelector('.volume-slider');
        const fullscreenBtn = player.querySelector('.fullscreen-btn');
        const pausePreview = player.querySelector('.pause-preview');
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
        
        playPauseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            if (currentlyPlayingVideo && currentlyPlayingVideo !== video) {
                currentlyPlayingVideo.pause();
                const otherPlayBtn = currentlyPlayingVideo.closest('.video-player').querySelector('.play-pause-btn');
                otherPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
            }
            
            if (video.paused) {
                video.play();
                playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                currentlyPlayingVideo = video;
            } else {
                video.pause();
                playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                currentlyPlayingVideo = null;
            }
        });

        video.addEventListener('timeupdate', () => {
            const progress = (video.currentTime / video.duration) * 100;
            progressSlider.value = progress;
        });

        progressSlider.addEventListener('input', () => {
            const time = (progressSlider.value / 100) * video.duration;
            video.currentTime = time;
        });

        volumeSlider.addEventListener('input', () => {
            video.volume = volumeSlider.value;
        });

        fullscreenBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (video.requestFullscreen) {
                video.requestFullscreen();
            } else if (video.mozRequestFullScreen) {
                video.mozRequestFullScreen();
            } else if (video.webkitRequestFullscreen) {
                video.webkitRequestFullscreen();
            } else if (video.msRequestFullscreen) {
                video.msRequestFullscreen();
            }
        });

        video.addEventListener('pause', () => {
            if (video.readyState >= 2) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                pausePreview.style.backgroundImage = `url(${canvas.toDataURL()})`;
                pausePreview.classList.add('visible');
            }
        });

        video.addEventListener('play', () => {
            pausePreview.classList.remove('visible');
        });

        video.addEventListener('seeked', () => {
            if (video.paused) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                pausePreview.style.backgroundImage = `url(${canvas.toDataURL()})`;
            }
        });
    });
});