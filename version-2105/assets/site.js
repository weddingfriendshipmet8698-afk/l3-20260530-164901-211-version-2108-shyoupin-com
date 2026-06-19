(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var navToggle = document.querySelector('.nav-toggle');
    var navLinks = document.getElementById('navLinks');
    if (navToggle && navLinks) {
      navToggle.addEventListener('click', function () {
        var opened = navLinks.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
      });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dotsWrap = hero.querySelector('[data-hero-dots]');
      var dots = dotsWrap ? Array.prototype.slice.call(dotsWrap.querySelectorAll('button')) : [];
      var prev = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
      var index = 0;
      var timer;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('active', i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('active', i === index);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
        }
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          show(i);
          start();
        });
      });

      if (prev) {
        prev.addEventListener('click', function () {
          show(index - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(index + 1);
          start();
        });
      }

      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
      show(0);
      start();
    }

    var filterInput = document.getElementById('movieFilter');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.library-grid .movie-card'));
    if (filterInput && cards.length) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q') || '';
      filterInput.value = query;

      function filterCards() {
        var value = filterInput.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-tags') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-year') || ''
          ].join(' ').toLowerCase();
          card.classList.toggle('is-hidden', value && haystack.indexOf(value) === -1);
        });
      }

      filterInput.addEventListener('input', filterCards);
      filterCards();
    }

    Array.prototype.slice.call(document.querySelectorAll('video[data-stream]')).forEach(function (video) {
      var stream = video.getAttribute('data-stream');
      var frame = video.closest('.player-frame');
      var button = frame ? frame.querySelector('.play-overlay') : null;

      if (stream) {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (!video.currentSrc) {
          video.src = stream;
        }
      }

      function playVideo() {
        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener('click', playVideo);
      }

      video.addEventListener('play', function () {
        if (frame) {
          frame.classList.add('is-playing');
        }
      });

      video.addEventListener('pause', function () {
        if (frame) {
          frame.classList.remove('is-playing');
        }
      });

      video.addEventListener('ended', function () {
        if (frame) {
          frame.classList.remove('is-playing');
        }
      });
    });
  });
})();
