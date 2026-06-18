(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-mobile-menu]');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-slide-dot]'));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
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
        show(Number(dot.getAttribute('data-slide-dot')) || 0);
        start();
      });
    });
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    start();
  });

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var input = scope.querySelector('[data-filter-input]');
    var region = scope.querySelector('[data-region-filter]');
    var year = scope.querySelector('[data-year-filter]');
    var type = scope.querySelector('[data-type-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var params = new URLSearchParams(window.location.search);
    if (input && params.get('q')) {
      input.value = params.get('q');
    }
    if (region && params.get('region')) {
      region.value = params.get('region');
    }
    if (year && params.get('year')) {
      year.value = params.get('year');
    }
    if (type && params.get('type')) {
      type.value = params.get('type');
    }
    function normalize(value) {
      return (value || '').toString().trim().toLowerCase();
    }
    function apply() {
      var q = normalize(input && input.value);
      var selectedRegion = region ? region.value : '';
      var selectedYear = year ? year.value : '';
      var selectedType = type ? type.value : '';
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type')
        ].join(' '));
        var match = true;
        if (q && haystack.indexOf(q) === -1) {
          match = false;
        }
        if (selectedRegion && card.getAttribute('data-region') !== selectedRegion) {
          match = false;
        }
        if (selectedYear && card.getAttribute('data-year') !== selectedYear) {
          match = false;
        }
        if (selectedType && card.getAttribute('data-type') !== selectedType) {
          match = false;
        }
        card.style.display = match ? '' : 'none';
      });
    }
    [input, region, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
    apply();
  });
})();
