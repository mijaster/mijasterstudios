window.addEventListener("load", () => {
    const preloader = document.querySelector(".preloader");
    preloader.classList.add("loaded");

    setTimeout(() => {
        preloader.style.display = "none";
    }, 500);
});

document.addEventListener("DOMContentLoaded", () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
            }
        });
    }, {
        threshold: 0.2,
    });

    const animatedElements = document.querySelectorAll(".fade-in-left, .fade-in-right, .fade-in-up");
    animatedElements.forEach((element) => {
        observer.observe(element);
    });
});