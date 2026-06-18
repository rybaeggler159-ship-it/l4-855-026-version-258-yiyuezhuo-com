(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupFallbackImages() {
    document.querySelectorAll("img[data-fallback]").forEach(function (image) {
      image.addEventListener("error", function () {
        if (image.dataset.fallbackApplied === "true") {
          return;
        }
        image.dataset.fallbackApplied = "true";
        image.src = image.dataset.fallback;
      });
    });

    document.querySelectorAll("video[data-fallback]").forEach(function (video) {
      video.addEventListener("error", function () {
        if (!video.poster && video.dataset.fallback) {
          video.poster = video.dataset.fallback;
        }
      });
    });
  }

  function setupMobileNavigation() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");

    if (!button || !nav) {
      return;
    }

    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
      button.classList.toggle("is-open");
    });
  }

  function setupHeroCarousel() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var previous = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5000);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (previous) {
      previous.addEventListener("click", function () {
        showSlide(activeIndex - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(activeIndex + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.dataset.heroDot || 0));
        startTimer();
      });
    });

    hero.addEventListener("mouseenter", stopTimer);
    hero.addEventListener("mouseleave", startTimer);
    showSlide(0);
    startTimer();
  }

  function setupCardFilters() {
    var grid = document.querySelector("[data-filterable-grid]");

    if (!grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));
    var searchInput = document.querySelector("[data-card-search]");
    var categorySelect = document.querySelector("[data-category-filter]");
    var yearSelect = document.querySelector("[data-year-filter]");
    var sortSelect = document.querySelector("[data-sort-filter]");
    var countLabel = document.querySelector("[data-filter-count]");

    function matchesYear(card, value) {
      if (!value) {
        return true;
      }
      var year = Number(card.dataset.year || 0);
      if (value === "2020") {
        return year <= 2020;
      }
      return String(year) === value;
    }

    function applyFilters() {
      var keyword = normalize(searchInput && searchInput.value);
      var category = normalize(categorySelect && categorySelect.value);
      var year = yearSelect ? yearSelect.value : "";
      var sort = sortSelect ? sortSelect.value : "default";
      var visible = [];

      cards.forEach(function (card) {
        var haystack = normalize(card.dataset.keywords);
        var cardCategory = normalize(card.dataset.category);
        var isMatch = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          isMatch = false;
        }
        if (category && cardCategory !== category) {
          isMatch = false;
        }
        if (!matchesYear(card, year)) {
          isMatch = false;
        }

        card.classList.toggle("is-hidden", !isMatch);
        if (isMatch) {
          visible.push(card);
        }
      });

      if (sort !== "default") {
        visible.sort(function (a, b) {
          return Number(b.dataset[sort] || 0) - Number(a.dataset[sort] || 0);
        });
        visible.forEach(function (card) {
          grid.appendChild(card);
        });
      }

      if (countLabel) {
        countLabel.textContent = "显示 " + visible.length + " / " + cards.length + " 部";
      }
    }

    [searchInput, categorySelect, yearSelect, sortSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });

    applyFilters();
  }

  function cardTemplate(movie) {
    return [
      '<article class="movie-card">',
      '  <a class="movie-card-link" href="' + movie.url + '">',
      '    <div class="poster-frame">',
      '      <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" data-fallback="assets/img/fallback.svg">',
      '      <span class="duration-badge">' + escapeHtml(movie.duration) + '</span>',
      '    </div>',
      '    <div class="movie-card-body">',
      '      <h3>' + escapeHtml(movie.title) + '</h3>',
      '      <p>' + escapeHtml(movie.one_line) + '</p>',
      '      <div class="movie-meta-row">',
      '        <span>★ ' + escapeHtml(movie.rating) + '</span>',
      '        <span>' + escapeHtml(movie.year) + '</span>',
      '      </div>',
      '      <div class="movie-meta-row movie-meta-muted">',
      '        <span>' + escapeHtml(movie.region) + '</span>',
      '        <span>' + escapeHtml(movie.type) + '</span>',
      '      </div>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join("
");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupSearchPage() {
    var app = document.querySelector("[data-search-app]");

    if (!app) {
      return;
    }

    var input = app.querySelector("[data-search-page-input]");
    var sortSelect = app.querySelector("[data-search-page-sort]");
    var results = app.querySelector("[data-search-page-results]");
    var count = app.querySelector("[data-search-page-count]");
    var movies = [];
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (input) {
      input.value = initialQuery;
    }

    function render() {
      var keyword = normalize(input && input.value);
      var sort = sortSelect ? sortSelect.value : "views";
      var filtered = movies.filter(function (movie) {
        return !keyword || normalize(movie.search_text).indexOf(keyword) !== -1;
      });

      filtered.sort(function (a, b) {
        return Number(b[sort] || 0) - Number(a[sort] || 0);
      });

      var pageItems = filtered.slice(0, 120);
      results.innerHTML = pageItems.map(cardTemplate).join("
");
      setupFallbackImages();

      if (count) {
        count.textContent = "找到 " + filtered.length + " 部，当前显示 " + pageItems.length + " 部";
      }
    }

    fetch(app.dataset.dataSource)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        movies = data;
        render();
      })
      .catch(function () {
        if (count) {
          count.textContent = "搜索数据加载失败，请从全部影片页面浏览。";
        }
      });

    if (input) {
      input.addEventListener("input", render);
    }
    if (sortSelect) {
      sortSelect.addEventListener("change", render);
    }
  }

  ready(function () {
    setupFallbackImages();
    setupMobileNavigation();
    setupHeroCarousel();
    setupCardFilters();
    setupSearchPage();
  });
})();
