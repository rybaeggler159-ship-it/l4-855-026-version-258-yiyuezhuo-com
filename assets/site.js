(function () {
    const fallbackSources = [
        "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
        "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_ts/master.m3u8",
        "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8"
    ];

    function unique(values) {
        return Array.from(new Set(values.filter(Boolean)));
    }

    function initMenu() {
        const button = document.querySelector("[data-menu-toggle]");
        const panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            const open = panel.classList.toggle("is-open");
            document.body.classList.toggle("menu-open", open);
            button.textContent = open ? "×" : "☰";
        });
        panel.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                panel.classList.remove("is-open");
                document.body.classList.remove("menu-open");
                button.textContent = "☰";
            });
        });
    }

    function initHero() {
        const hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        const slides = Array.from(hero.querySelectorAll(".hero-slide"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        const nextButton = hero.querySelector("[data-hero-next]");
        const prevButton = hero.querySelector("[data-hero-prev]");
        if (!slides.length) {
            return;
        }
        let index = 0;
        let timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (nextButton) {
            nextButton.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }
        if (prevButton) {
            prevButton.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.dataset.heroDot || 0));
                restart();
            });
        });
        restart();
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function applyFilters(targetSelector) {
        const target = document.querySelector(targetSelector);
        if (!target) {
            return;
        }
        const textInput = document.querySelector(`[data-filter-input][data-filter-target="${targetSelector}"]`);
        const selects = Array.from(document.querySelectorAll(`[data-filter-select][data-filter-target="${targetSelector}"]`));
        const text = normalize(textInput ? textInput.value : "");
        const criteria = {};
        selects.forEach(function (select) {
            criteria[select.dataset.filterSelect] = normalize(select.value);
        });
        target.querySelectorAll("[data-search-card]").forEach(function (card) {
            const haystack = normalize(card.dataset.search || card.textContent);
            const titleMatch = !text || haystack.includes(text);
            const typeMatch = !criteria.type || normalize(card.dataset.type).includes(criteria.type);
            const yearMatch = !criteria.year || normalize(card.dataset.year).startsWith(criteria.year);
            card.hidden = !(titleMatch && typeMatch && yearMatch);
        });
    }

    function initFilters() {
        const controls = Array.from(document.querySelectorAll("[data-filter-input], [data-filter-select]"));
        const targets = unique(controls.map(function (control) {
            return control.dataset.filterTarget;
        }));
        const params = new URLSearchParams(window.location.search);
        const query = params.get("q");
        targets.forEach(function (selector) {
            const input = document.querySelector(`[data-filter-input][data-filter-target="${selector}"]`);
            if (input && query) {
                input.value = query;
            }
            applyFilters(selector);
        });
        controls.forEach(function (control) {
            control.addEventListener("input", function () {
                applyFilters(control.dataset.filterTarget);
            });
            control.addEventListener("change", function () {
                applyFilters(control.dataset.filterTarget);
            });
        });
    }

    let hlsPromise = null;

    function loadHlsLibrary() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }
        if (hlsPromise) {
            return hlsPromise;
        }
        hlsPromise = new Promise(function (resolve, reject) {
            const script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js";
            script.async = true;
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
        return hlsPromise;
    }

    function initPlayers() {
        document.querySelectorAll("[data-player]").forEach(function (player) {
            const video = player.querySelector("video[data-src]");
            const button = player.querySelector("[data-player-button]");
            if (!video || !button) {
                return;
            }
            const sources = unique([video.dataset.src].concat(fallbackSources));
            let hls = null;
            let sourceIndex = 0;
            let started = false;

            function markReady() {
                player.classList.add("is-ready");
            }

            function markPlaying() {
                player.classList.add("is-playing");
            }

            function trySource() {
                const src = sources[sourceIndex];
                if (!src) {
                    return Promise.reject(new Error("source unavailable"));
                }
                if (hls) {
                    hls.destroy();
                    hls = null;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = src;
                    markReady();
                    return video.play();
                }
                return loadHlsLibrary().then(function (Hls) {
                    if (!Hls || !Hls.isSupported()) {
                        video.src = src;
                        markReady();
                        return video.play();
                    }
                    return new Promise(function (resolve, reject) {
                        hls = new Hls({
                            enableWorker: true,
                            lowLatencyMode: false
                        });
                        hls.loadSource(src);
                        hls.attachMedia(video);
                        hls.on(Hls.Events.MANIFEST_PARSED, function () {
                            markReady();
                            video.play().then(resolve).catch(resolve);
                        });
                        hls.on(Hls.Events.ERROR, function (event, data) {
                            if (data && data.fatal) {
                                reject(new Error("hls fatal"));
                            }
                        });
                    });
                });
            }

            function start() {
                if (started && !video.paused) {
                    return;
                }
                started = true;
                trySource().catch(function retry() {
                    sourceIndex += 1;
                    if (sourceIndex < sources.length) {
                        return trySource().catch(retry);
                    }
                    player.classList.remove("is-ready");
                });
            }

            button.addEventListener("click", start);
            video.addEventListener("play", markPlaying);
            video.addEventListener("pause", function () {
                player.classList.remove("is-playing");
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
}());
