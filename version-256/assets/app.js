(function () {
    var menuButton = document.querySelector('.mobile-menu-button');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var opened = mobileNav.classList.toggle('open');
            menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function play() {
            stop();
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot') || 0));
                play();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                play();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                play();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', play);
        showSlide(0);
        play();
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));

    searchInputs.forEach(function (input) {
        input.addEventListener('input', function () {
            var query = input.value.trim().toLowerCase();
            var scope = input.closest('section') && input.closest('section').querySelector('[data-search-scope]');
            var cards;

            if (scope) {
                cards = Array.prototype.slice.call(scope.querySelectorAll('[data-search]'));
            } else {
                cards = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));
            }

            cards.forEach(function (card) {
                var value = (card.getAttribute('data-search') || '').toLowerCase();
                card.classList.toggle('hidden-by-search', query && value.indexOf(query) === -1);
            });
        });
    });

    var players = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));

    players.forEach(function (shell) {
        var video = shell.querySelector('video');
        var overlay = shell.querySelector('.play-overlay');

        if (!video || !overlay) {
            return;
        }

        function ensureLoaded() {
            var url = video.getAttribute('data-stream');

            if (!url || video.getAttribute('data-ready') === '1') {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hls.loadSource(url);
                hls.attachMedia(video);
                shell._hls = hls;
            } else {
                video.src = url;
            }

            video.setAttribute('data-ready', '1');
        }

        function start() {
            ensureLoaded();
            overlay.classList.add('is-hidden');
            video.controls = true;

            var promise = video.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        overlay.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
    });
})();
