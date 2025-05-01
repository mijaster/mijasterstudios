window.addEventListener("load", () => {
    const preloader = document.querySelector(".preloader");
    if (preloader) {
        preloader.classList.add("loaded");
        setTimeout(() => {
            preloader.style.display = "none";
        }, 500);
    }
});

document.addEventListener("DOMContentLoaded", () => {
    // Header scroll effect
    const header = document.querySelector('header');
    const scrollThreshold = 100;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > scrollThreshold) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Intersection Observer для анимаций
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
            }
        });
    }, { threshold: 0.2 });

    const animatedElements = document.querySelectorAll(".fade-in-left, .fade-in-right, .fade-in-up");
    animatedElements.forEach((element) => {
        observer.observe(element);
    });

    // Инициализация бургер-меню
    function initBurgerMenu() {
        const burgerMenu = document.querySelector('.burger-menu');
        const navMenu = document.querySelector('.nav-menu');
        const burgerIcon = document.querySelector('.burger-icon');
        const navLinks = document.querySelectorAll('.nav-links a');

        if (burgerMenu && navMenu) {
            burgerMenu.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                burgerIcon.classList.toggle('active');
                document.body.classList.toggle('no-scroll');
            });

            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                    burgerIcon.classList.remove('active');
                    document.body.classList.remove('no-scroll');
                });
            });

            document.addEventListener('click', (event) => {
                const isClickInside = navMenu.contains(event.target) || burgerMenu.contains(event.target);
                if (!isClickInside && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    burgerIcon.classList.remove('active');
                    document.body.classList.remove('no-scroll');
                }
            });

            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape' && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    burgerIcon.classList.remove('active');
                    document.body.classList.remove('no-scroll');
                }
            });
        }
    }

    // Загрузка компонентов
    function loadComponents() {
        function loadComponent(url, containerId) {
            fetch(url)
                .then(response => {
                    if (!response.ok) throw new Error(`Ошибка загрузки ${url}: ${response.status}`);
                    return response.text();
                })
                .then(data => {
                    const container = document.getElementById(containerId);
                    if (container) container.innerHTML = data;
                    if (containerId === 'header-container') initBurgerMenu();
                })
                .catch(error => console.error(error));
        }

        loadComponent('header.html', 'header-container');
        loadComponent('footer.html', 'footer-container');
        loadComponent('preloader.html', 'preloader-container');
    }

    loadComponents();
});