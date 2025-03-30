document.addEventListener("DOMContentLoaded", () => {
    const imgPath = "games/lc/poster.png";

    console.log("Загрузка изображения:", imgPath);

    const img = new Image();
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
});