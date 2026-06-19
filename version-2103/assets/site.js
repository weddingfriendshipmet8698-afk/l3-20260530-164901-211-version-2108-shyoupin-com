(function() {
  var menuButton = document.querySelector('.menu-button');
  var mobileNav = document.querySelector('.mobile-nav');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function() {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;
  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function(slide, i) {
      slide.classList.toggle('active', i === current);
    });
    dots.forEach(function(dot, i) {
      dot.classList.toggle('active', i === current);
    });
  }
  var prev = document.querySelector('.hero-prev');
  var next = document.querySelector('.hero-next');
  if (prev) {
    prev.addEventListener('click', function() {
      showSlide(current - 1);
    });
  }
  if (next) {
    next.addEventListener('click', function() {
      showSlide(current + 1);
    });
  }
  dots.forEach(function(dot) {
    dot.addEventListener('click', function() {
      showSlide(Number(dot.getAttribute('data-slide')) || 0);
    });
  });
  if (slides.length > 1) {
    window.setInterval(function() {
      showSlide(current + 1);
    }, 6500);
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.js-search'));
  var yearSelects = Array.prototype.slice.call(document.querySelectorAll('.js-year'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('.js-movie-card'));
  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }
  function filterCards() {
    var keyword = normalize(searchInputs.map(function(input) {
      return input.value;
    }).find(Boolean));
    var year = yearSelects.map(function(select) {
      return select.value;
    }).find(Boolean) || '';
    cards.forEach(function(card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-year')
      ].join(' '));
      var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var okYear = !year || card.getAttribute('data-year') === year;
      card.classList.toggle('hidden', !(okKeyword && okYear));
    });
  }
  searchInputs.forEach(function(input) {
    input.addEventListener('input', filterCards);
  });
  yearSelects.forEach(function(select) {
    select.addEventListener('change', filterCards);
  });
})();

function initPlayer(videoUrl) {
  var shell = document.querySelector('.js-player');
  var video = document.querySelector('.js-video');
  var cover = document.querySelector('.js-play-cover');
  var button = document.querySelector('.js-play-button');
  if (!shell || !video || !videoUrl) {
    return;
  }
  var hlsInstance = null;
  function begin() {
    shell.classList.add('is-playing');
    if (cover) {
      cover.hidden = true;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (video.src !== videoUrl) {
        video.src = videoUrl;
      }
      video.play().catch(function() {});
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      if (!hlsInstance) {
        hlsInstance = new Hls({ enableWorker: true });
        hlsInstance.loadSource(videoUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, function() {
          video.play().catch(function() {});
        });
      } else {
        video.play().catch(function() {});
      }
      return;
    }
    if (video.src !== videoUrl) {
      video.src = videoUrl;
    }
    video.play().catch(function() {});
  }
  if (cover) {
    cover.addEventListener('click', begin);
  }
  if (button) {
    button.addEventListener('click', begin);
  }
  video.addEventListener('click', function() {
    if (video.paused) {
      begin();
    } else {
      video.pause();
    }
  });
}
