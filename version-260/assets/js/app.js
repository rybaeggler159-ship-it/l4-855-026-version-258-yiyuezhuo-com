document.addEventListener("DOMContentLoaded", function () {
    var menuToggle = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener("click", function () {
            var isOpen = mobileNav.classList.toggle("is-open");
            menuToggle.setAttribute("aria-expanded", String(isOpen));
        });
    }

    var hero = document.querySelector(".hero-carousel");

    if (hero) {
        var slides = Array.from(hero.querySelectorAll(".hero-slide"));
        var dots = Array.from(hero.querySelectorAll(".hero-dot"));
        var prevButton = hero.querySelector("[data-hero-prev]");
        var nextButton = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        if (prevButton) {
            prevButton.addEventListener("click", function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (nextButton) {
            nextButton.addEventListener("click", function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    var localFilter = document.querySelector(".js-card-filter");

    if (localFilter) {
        localFilter.addEventListener("input", function () {
            var keyword = localFilter.value.trim().toLowerCase();
            var cards = document.querySelectorAll(".movie-card[data-title]");

            cards.forEach(function (card) {
                var haystack = ((card.dataset.title || "") + " " + (card.dataset.meta || "")).toLowerCase();
                card.classList.toggle("hidden-card", keyword !== "" && !haystack.includes(keyword));
            });
        });
    }
});
