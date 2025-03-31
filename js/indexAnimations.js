document.addEventListener("DOMContentLoaded", () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
            } else {
                entry.target.classList.remove("active");
            }
        });
    }, {
        threshold: 0.3, // Элемент становится активным, когда 30% его видно
    });

    // Наблюдение за блоками
    const animatedElements = document.querySelectorAll(".fade-in-up, .fade-in-left");
    animatedElements.forEach((element) => {
        observer.observe(element);
    });
});