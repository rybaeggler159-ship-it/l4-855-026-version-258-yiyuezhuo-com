(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dotsWrap = carousel.querySelector('[data-hero-dots]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      if (dotsWrap) {
        Array.prototype.slice.call(dotsWrap.children).forEach(function (dot, dotIndex) {
          dot.classList.toggle('active', dotIndex === current);
        });
      }
    }

    if (dotsWrap && slides.length > 1) {
      slides.forEach(function (_, index) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', '切换推荐影片');
        dot.addEventListener('click', function () {
          showSlide(index);
          restart();
        });
        dotsWrap.appendChild(dot);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      if (slides.length > 1) {
        timer = window.setInterval(function () {
          showSlide(current + 1);
        }, 5200);
      }
    }

    showSlide(0);
    restart();
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
  var yearFilters = Array.prototype.slice.call(document.querySelectorAll('[data-filter-year]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

  function getQueryFromUrl() {
    try {
      return new URLSearchParams(window.location.search).get('q') || '';
    } catch (error) {
      return '';
    }
  }

  function applyFilters() {
    var query = searchInputs.length ? searchInputs[0].value.trim().toLowerCase() : '';
    var year = yearFilters.length ? yearFilters[0].value : '';

    cards.forEach(function (card) {
      var text = [
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-region'),
        card.textContent
      ].join(' ').toLowerCase();
      var cardYear = card.getAttribute('data-year') || '';
      var matchQuery = !query || text.indexOf(query) !== -1;
      var matchYear = !year || cardYear.indexOf(year) !== -1;
      card.style.display = matchQuery && matchYear ? '' : 'none';
    });
  }

  if (searchInputs.length || yearFilters.length) {
    var urlQuery = getQueryFromUrl();
    if (urlQuery && searchInputs.length) {
      searchInputs.forEach(function (input) {
        input.value = urlQuery;
      });
    }
    searchInputs.forEach(function (input) {
      input.addEventListener('input', applyFilters);
    });
    yearFilters.forEach(function (select) {
      select.addEventListener('change', applyFilters);
    });
    applyFilters();
  }
})();
