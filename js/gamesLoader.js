document.addEventListener("DOMContentLoaded", async () => {
    try {
        await loadGamesFromConfig();
        setupMoreButtons();
    } catch (error) {
        console.error('Games loading error:', error);
        showErrorNotification('Не удалось загрузить список игр. Пожалуйста, попробуйте позже.');
    }
});

async function loadGamesFromConfig() {
    // Проверка наличия контейнера
    const gamesContainer = document.getElementById('games-container');
    if (!gamesContainer) {
        throw new Error('Games container not found');
    }

    // Загрузка конфига
    let gamesConfig;
    try {
        const response = await fetch('json/games_config.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        gamesConfig = await response.json();
        if (!gamesConfig || typeof gamesConfig !== 'object') {
            throw new Error('Invalid games config format');
        }
    } catch (error) {
        throw new Error(`Failed to load games config: ${error.message}`);
    }

    // Очистка контейнера
    gamesContainer.innerHTML = '';

    // Создание элементов игр
    try {
        for (const [gameId, gameData] of Object.entries(gamesConfig)) {
            if (!gameId || !gameData || !gameData.name) {
                console.warn('Skipping invalid game entry:', gameId);
                continue;
            }

            const gameElement = createGameElement(gameId, gameData);
            if (gameElement) {
                gamesContainer.appendChild(gameElement);
            }
        }
    } catch (error) {
        throw new Error(`Failed to create game elements: ${error.message}`);
    }
}

function createGameElement(gameId, gameData) {
    try {
        // Проверка обязательных полей
        if (!gameData.name || !gameData.poster) {
            console.warn(`Missing required fields for game ${gameId}`);
            return null;
        }

        const gameElement = document.createElement('div');
        gameElement.className = 'game';

        // Безопасное создание HTML
        const posterSrc = `games/${escapeHtml(gameId)}/${gameData.poster}`;
        gameElement.innerHTML = `
            <img src="${posterSrc}" alt="${escapeHtml(gameData.name)}" class="poster" onerror="this.src='imgs/posters/default_poster.png'">
            <div class="overlay"></div>
            <p class="name">${escapeHtml(gameData.name)}</p>
            <a href="#" class="more" id="${escapeHtml(gameId)}">Подробнее</a>
        `;

        return gameElement;
    } catch (error) {
        console.error(`Error creating element for game ${gameId}:`, error);
        return null;
    }
}

function setupMoreButtons() {
    try {
        const moreButtons = document.querySelectorAll(".more");
        moreButtons.forEach(button => {
            button.addEventListener("click", (event) => {
                event.preventDefault();
                try {
                    const gameId = button.id;
                    if (gameId) {
                        window.location.href = `game.html?gameId=${encodeURIComponent(gameId)}`;
                    }
                } catch (error) {
                    console.error('Error handling more button:', error);
                    showErrorNotification('Ошибка перехода к игре');
                }
            });
        });
    } catch (error) {
        console.error('Error setting up more buttons:', error);
    }
}

function showErrorNotification(message) {
    try {
        const existingNotification = document.querySelector('.error-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    } catch (error) {
        console.error('Error showing notification:', error);
    }
}

// Защита от XSS
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}