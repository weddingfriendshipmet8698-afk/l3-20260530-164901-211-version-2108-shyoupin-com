(function () {
  var heroTimer = null;

  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = all('[data-hero-slide]', hero);
    var dots = all('[data-hero-dot]', hero);
    var current = 0;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function restart() {
      if (heroTimer) {
        window.clearInterval(heroTimer);
      }
      heroTimer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    var next = hero.querySelector('[data-hero-next]');
    var prev = hero.querySelector('[data-hero-prev]');
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }
    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });
    show(0);
    restart();
  }

  function initFilters() {
    all('[data-filter-scope]').forEach(function (scope) {
      var section = scope.closest('.content-section') || document;
      var cards = all('[data-card-list] .movie-card', section);
      var search = scope.querySelector('.movie-search');
      var year = scope.querySelector('.year-filter');
      var type = scope.querySelector('.type-filter');

      function apply() {
        var q = search ? search.value.trim().toLowerCase() : '';
        var y = year ? year.value : '';
        var t = type ? type.value : '';
        cards.forEach(function (card) {
          var text = card.getAttribute('data-search') || '';
          var cardYear = card.getAttribute('data-year') || '';
          var cardType = card.getAttribute('data-type') || '';
          var visible = true;
          if (q && text.indexOf(q) === -1) {
            visible = false;
          }
          if (y && cardYear !== y) {
            visible = false;
          }
          if (t && cardType !== t) {
            visible = false;
          }
          card.classList.toggle('is-hidden', !visible);
        });
      }

      [search, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });
  }

  function attachHls(video, url, done) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      done();
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      video._hls = hls;
      hls.loadSource(url);
      hls.attachMedia(video);
      if (window.Hls.Events && window.Hls.Events.MANIFEST_PARSED) {
        hls.on(window.Hls.Events.MANIFEST_PARSED, done);
      } else {
        window.setTimeout(done, 300);
      }
      return;
    }
    video.src = url;
    done();
  }

  function initPlayers() {
    all('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var trigger = player.querySelector('[data-video-url]');
      if (!video || !trigger) {
        return;
      }
      function play() {
        var url = trigger.getAttribute('data-video-url');
        if (!url) {
          return;
        }
        trigger.classList.add('is-hidden');
        if (video.getAttribute('data-ready') === '1') {
          video.play().catch(function () {});
          return;
        }
        video.setAttribute('data-ready', '1');
        attachHls(video, url, function () {
          video.play().catch(function () {});
        });
      }
      trigger.addEventListener('click', play);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
