(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function initNavigation() {
    var button = one('[data-nav-toggle]');
    var menu = one('[data-nav-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var slider = one('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = all('.hero-slide', slider);
    var dots = all('[data-hero-dot]', slider);
    var next = one('[data-hero-next]', slider);
    var prev = one('[data-hero-prev]', slider);
    var active = 0;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, pos) {
        slide.classList.toggle('is-active', pos === active);
      });
      dots.forEach(function (dot, pos) {
        dot.classList.toggle('is-active', pos === active);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
      });
    }

    if (slides.length > 1) {
      window.setInterval(function () {
        show(active + 1);
      }, 5000);
    }
  }

  function initSearch() {
    var panel = one('[data-search-panel]');
    var input = one('[data-search-input]');
    var count = one('[data-search-count]');
    var cards = all('[data-search]');
    if (!panel || !input || !cards.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    input.value = query;

    function applyFilter(value) {
      var words = value.trim().toLowerCase().split(/\s+/).filter(Boolean);
      var visible = 0;
      cards.forEach(function (card) {
        var text = card.getAttribute('data-search') || '';
        var matched = words.length === 0 || words.every(function (word) {
          return text.indexOf(word) !== -1;
        });
        card.setAttribute('data-search-hidden', matched ? 'false' : 'true');
        if (matched) {
          visible += 1;
        }
      });
      if (count) {
        count.textContent = String(visible);
      }
    }

    input.addEventListener('input', function () {
      applyFilter(input.value);
    });

    panel.addEventListener('submit', function (event) {
      event.preventDefault();
      var target = input.value.trim();
      var url = target ? 'search.html?q=' + encodeURIComponent(target) : 'search.html';
      window.history.replaceState(null, '', url);
      applyFilter(target);
    });

    applyFilter(query);
  }

  function initPlayers() {
    all('video[data-hls-src]').forEach(function (video) {
      var source = video.getAttribute('data-hls-src');
      if (!source) {
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      }
    });
  }

  function initImages() {
    all('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.style.opacity = '0';
      }, { once: true });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initHero();
    initSearch();
    initPlayers();
    initImages();
  });
})();
