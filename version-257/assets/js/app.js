(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        if (!toggle) {
            return;
        }
        toggle.addEventListener("click", function () {
            document.body.classList.toggle("menu-open");
        });
    }

    function initForms() {
        document.querySelectorAll("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    if (input) {
                        input.focus();
                    }
                }
            });
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }
        show(0);
        restart();
    }

    function initSearchPage() {
        var input = document.querySelector("[data-page-search]");
        var year = document.querySelector("[data-year-filter]");
        var region = document.querySelector("[data-region-filter]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
        var empty = document.querySelector("[data-empty-state]");
        if (!input || !cards.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        input.value = params.get("q") || "";

        function apply() {
            var keyword = input.value.trim().toLowerCase();
            var yearValue = year ? year.value : "";
            var regionValue = region ? region.value : "";
            var visible = 0;
            cards.forEach(function (card) {
                var text = card.getAttribute("data-search") || "";
                var cardYear = card.getAttribute("data-year") || "";
                var cardRegion = card.getAttribute("data-region") || "";
                var match = true;
                if (keyword && text.indexOf(keyword) === -1) {
                    match = false;
                }
                if (yearValue && cardYear !== yearValue) {
                    match = false;
                }
                if (regionValue && cardRegion.indexOf(regionValue) === -1) {
                    match = false;
                }
                card.hidden = !match;
                if (match) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.style.display = visible ? "none" : "block";
            }
        }
        input.addEventListener("input", apply);
        if (year) {
            year.addEventListener("change", apply);
        }
        if (region) {
            region.addEventListener("change", apply);
        }
        apply();
    }

    window.staticMoviePlayer = function (videoId, url) {
        var video = document.getElementById(videoId);
        if (!video) {
            return;
        }
        var shell = video.closest(".player-shell");
        var cover = shell ? shell.querySelector(".player-cover") : null;
        var started = false;
        var hls = null;

        function start() {
            if (started) {
                video.play().catch(function () {});
                return;
            }
            started = true;
            if (shell) {
                shell.classList.add("playing");
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
            } else {
                video.src = url;
            }
            video.play().catch(function () {});
        }

        if (cover) {
            cover.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (!started) {
                start();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    ready(function () {
        initMenu();
        initForms();
        initHero();
        initSearchPage();
    });
})();
