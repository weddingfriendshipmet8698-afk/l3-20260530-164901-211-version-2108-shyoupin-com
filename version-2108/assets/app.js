(function() {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-nav]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function() {
      menu.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = selectAll("[data-hero-slide]", hero);
    var dots = selectAll("[data-hero-dot]", hero);
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      clearInterval(timer);
      timer = setInterval(function() {
        show(current + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener("click", function() {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function() {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        show(parseInt(dot.getAttribute("data-hero-dot"), 10) || 0);
        start();
      });
    });
    show(0);
    start();
  }

  function initFilters() {
    selectAll("[data-filter-panel]").forEach(function(panel) {
      var input = panel.querySelector("[data-filter-input]");
      var year = panel.querySelector("[data-year-filter]");
      var region = panel.querySelector("[data-region-filter]");
      var reset = panel.querySelector("[data-filter-reset]");
      var grid = panel.parentElement.querySelector("[data-filter-grid]");
      var result = panel.parentElement.querySelector("[data-filter-result]");
      if (!grid) {
        return;
      }
      var cards = selectAll("[data-card]", grid);
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q") || "";
      if (input && query) {
        input.value = query;
      }

      function apply() {
        var keyword = normalize(input && input.value);
        var yearValue = normalize(year && year.value);
        var regionValue = normalize(region && region.value);
        var shown = 0;
        cards.forEach(function(card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" "));
          var okKeyword = !keyword || haystack.indexOf(keyword) >= 0;
          var okYear = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
          var okRegion = !regionValue || normalize(card.getAttribute("data-region")) === regionValue;
          var visible = okKeyword && okYear && okRegion;
          card.classList.toggle("is-hidden", !visible);
          if (visible) {
            shown += 1;
          }
        });
        if (result) {
          result.textContent = shown ? "已匹配到 " + shown + " 部内容" : "暂无匹配内容";
        }
      }

      [input, year, region].forEach(function(control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      if (reset) {
        reset.addEventListener("click", function() {
          if (input) {
            input.value = "";
          }
          if (year) {
            year.value = "";
          }
          if (region) {
            region.value = "";
          }
          apply();
        });
      }
      apply();
    });
  }

  window.initVideoPlayer = function(streamUrl) {
    var video = document.querySelector(".watch-video");
    var layer = document.querySelector(".watch-poster-layer");
    var ready = false;
    var hls = null;

    if (!video || !streamUrl) {
      return;
    }

    function attach() {
      if (ready) {
        return;
      }
      ready = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function play() {
      attach();
      if (layer) {
        layer.classList.add("is-hidden");
      }
      video.setAttribute("controls", "controls");
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function() {});
      }
    }

    if (layer) {
      layer.addEventListener("click", play);
    }
    video.addEventListener("click", function() {
      if (video.paused) {
        play();
      }
    });
    window.addEventListener("pagehide", function() {
      if (hls && hls.destroy) {
        hls.destroy();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function() {
    initMenu();
    initHero();
    initFilters();
  });
})();
