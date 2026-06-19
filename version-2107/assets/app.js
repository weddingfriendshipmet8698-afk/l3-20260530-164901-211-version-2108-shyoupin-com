(function () {
  var navButton = document.querySelector('[data-nav-toggle]');
  var navLinks = document.querySelector('[data-nav-links]');
  if (navButton && navLinks) {
    navButton.addEventListener('click', function () {
      navLinks.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;

  function setHero(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, idx) {
      slide.classList.toggle('is-active', idx === current);
    });
    dots.forEach(function (dot, idx) {
      dot.classList.toggle('is-active', idx === current);
    });
  }

  dots.forEach(function (dot, idx) {
    dot.addEventListener('click', function () {
      setHero(idx);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      setHero(current + 1);
    }, 5000);
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterYear = document.querySelector('[data-filter-year]');
  var filterType = document.querySelector('[data-filter-type]');
  var filterRegion = document.querySelector('[data-filter-region]');
  var filterCards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));

  function valueOf(item, name) {
    return (item.getAttribute(name) || '').toLowerCase();
  }

  function runFilter() {
    var q = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var y = filterYear ? filterYear.value : '';
    var t = filterType ? filterType.value.toLowerCase() : '';
    var r = filterRegion ? filterRegion.value.toLowerCase() : '';

    filterCards.forEach(function (card) {
      var hay = [
        valueOf(card, 'data-title'),
        valueOf(card, 'data-year'),
        valueOf(card, 'data-type'),
        valueOf(card, 'data-region'),
        valueOf(card, 'data-genre')
      ].join(' ');
      var show = true;
      if (q && hay.indexOf(q) === -1) {
        show = false;
      }
      if (y && valueOf(card, 'data-year') !== y) {
        show = false;
      }
      if (t && valueOf(card, 'data-type').indexOf(t) === -1) {
        show = false;
      }
      if (r && valueOf(card, 'data-region').indexOf(r) === -1) {
        show = false;
      }
      card.classList.toggle('hidden-card', !show);
    });
  }

  [filterInput, filterYear, filterType, filterRegion].forEach(function (el) {
    if (el) {
      el.addEventListener('input', runFilter);
      el.addEventListener('change', runFilter);
    }
  });
})();
