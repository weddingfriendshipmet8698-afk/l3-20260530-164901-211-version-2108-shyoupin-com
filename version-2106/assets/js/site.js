(function() {
  var body = document.body;
  var menuToggle = document.querySelector('[data-menu-toggle]');

  if (menuToggle) {
    menuToggle.addEventListener('click', function() {
      body.classList.toggle('menu-open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function(hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var timer = null;

    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function(slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === index);
      });
      dots.forEach(function(dot, itemIndex) {
        dot.classList.toggle('is-active', itemIndex === index);
      });
    }

    function play() {
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function(dot, dotIndex) {
      dot.addEventListener('click', function() {
        window.clearInterval(timer);
        show(dotIndex);
        play();
      });
    });

    hero.addEventListener('mouseenter', function() {
      window.clearInterval(timer);
    });

    hero.addEventListener('mouseleave', function() {
      play();
    });

    show(0);
    play();
  });

  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));
  var chips = Array.prototype.slice.call(document.querySelectorAll('[data-chip-filter]'));
  var empty = document.querySelector('[data-empty-state]');
  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get('q') || '';
  var activeChip = '';

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilter() {
    var query = normalize(inputs.map(function(input) {
      return input.value;
    }).filter(Boolean)[0] || '');
    var chip = normalize(activeChip);
    var visible = 0;

    cards.forEach(function(card) {
      var text = normalize(card.getAttribute('data-text'));
      var matchQuery = !query || text.indexOf(query) !== -1;
      var matchChip = !chip || text.indexOf(chip) !== -1;
      var match = matchQuery && matchChip;
      card.hidden = !match;
      if (match) {
        visible += 1;
      }
    });

    if (empty) {
      empty.hidden = visible !== 0;
    }
  }

  inputs.forEach(function(input) {
    if (initialQuery && !input.value) {
      input.value = initialQuery;
    }
    input.addEventListener('input', applyFilter);
  });

  chips.forEach(function(chip) {
    chip.addEventListener('click', function() {
      activeChip = chip.getAttribute('data-chip-filter') || '';
      chips.forEach(function(item) {
        item.classList.toggle('is-active', item === chip);
      });
      applyFilter();
    });
  });

  if (cards.length && (initialQuery || chips.length)) {
    applyFilter();
  }
}());
