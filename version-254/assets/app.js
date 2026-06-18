document.addEventListener('DOMContentLoaded', function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });

    show(0);
    if (slides.length > 1) {
      setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  });

  document.querySelectorAll('[data-filter-root]').forEach(function (root) {
    var search = root.querySelector('[data-filter-search]');
    var genre = root.querySelector('[data-filter-genre]');
    var year = root.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(root.querySelectorAll('[data-movie-card]'));
    var empty = root.querySelector('[data-empty]');

    function match(card) {
      var keyword = search ? search.value.trim().toLowerCase() : '';
      var genreValue = genre ? genre.value : '';
      var yearValue = year ? year.value : '';
      var text = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-genre') || '',
        card.getAttribute('data-region') || '',
        card.getAttribute('data-year') || ''
      ].join(' ').toLowerCase();
      var genreText = card.getAttribute('data-genre') || '';
      var yearText = card.getAttribute('data-year') || '';

      return (!keyword || text.indexOf(keyword) !== -1) &&
        (!genreValue || genreText.indexOf(genreValue) !== -1) &&
        (!yearValue || yearText === yearValue);
    }

    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var ok = match(card);
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }

    [search, genre, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  });
});
