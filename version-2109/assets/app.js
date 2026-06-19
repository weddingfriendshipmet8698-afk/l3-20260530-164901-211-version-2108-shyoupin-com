(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var navToggle = document.querySelector(".nav-toggle");
    var siteNav = document.querySelector(".site-nav");

    if (navToggle && siteNav) {
      navToggle.addEventListener("click", function () {
        var open = siteNav.classList.toggle("open");
        navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    setupHero();
    setupCategoryFilter();
    setupSearchPage();
  });

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    if (!slides.length) {
      return;
    }

    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector(".hero-control.prev");
    var next = document.querySelector(".hero-control.next");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
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
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-target")) || 0);
        start();
      });
    });

    start();
  }

  function setupCategoryFilter() {
    var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));

    panels.forEach(function (panel) {
      var input = panel.querySelector(".filter-input");
      var buttons = Array.prototype.slice.call(panel.querySelectorAll("[data-filter]"));
      var cards = Array.prototype.slice.call(panel.querySelectorAll(".movie-card"));
      var empty = panel.querySelector(".empty-state");
      var activeFilter = "all";

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var visible = 0;

        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var genre = card.getAttribute("data-genre") || "";
          var matchesText = !keyword || text.indexOf(keyword) !== -1;
          var matchesFilter = activeFilter === "all" || genre === activeFilter || text.indexOf(activeFilter.toLowerCase()) !== -1;
          var show = matchesText && matchesFilter;

          card.hidden = !show;
          if (show) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          buttons.forEach(function (item) {
            item.classList.remove("active");
          });
          button.classList.add("active");
          activeFilter = button.getAttribute("data-filter") || "all";
          apply();
        });
      });
    });
  }

  function setupSearchPage() {
    var container = document.getElementById("search-results");
    if (!container || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    var input = document.getElementById("search-page-input");
    var empty = document.getElementById("search-empty");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (input) {
      input.value = initialQuery;
      input.addEventListener("input", function () {
        render(input.value);
      });
    }

    render(initialQuery);

    function render(query) {
      var keyword = (query || "").trim().toLowerCase();
      var results = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
        if (!keyword) {
          return false;
        }
        return movie.search.indexOf(keyword) !== -1;
      }).slice(0, 80);

      container.innerHTML = results.map(renderCard).join("");
      if (empty) {
        empty.hidden = keyword ? results.length !== 0 : true;
      }
    }

    function renderCard(movie) {
      var tags = movie.tags.slice(0, 3).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");

      return [
        "<article class=\"movie-card\">",
        "  <a class=\"card-poster\" href=\"" + escapeHtml(movie.file) + "\" aria-label=\"" + escapeHtml(movie.title) + "\">",
        "    <img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\" />",
        "    <span class=\"card-year\">" + escapeHtml(movie.year) + "</span>",
        "    <span class=\"card-play\">▶</span>",
        "  </a>",
        "  <div class=\"card-body\">",
        "    <h3><a href=\"" + escapeHtml(movie.file) + "\">" + escapeHtml(movie.title) + "</a></h3>",
        "    <p>" + escapeHtml(movie.oneLine) + "</p>",
        "    <div class=\"tag-list\">" + tags + "</div>",
        "  </div>",
        "</article>"
      ].join("");
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  window.initVideoPlayer = function (videoId, buttonId, sourceUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);

    if (!video || !button || !sourceUrl) {
      return;
    }

    var attached = false;

    function attach() {
      if (attached) {
        return;
      }

      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        video.hlsPlayer = hls;
      } else {
        video.src = sourceUrl;
      }
    }

    function play() {
      attach();
      button.classList.add("hidden");
      var attempt = video.play();

      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          button.classList.remove("hidden");
        });
      }
    }

    button.addEventListener("click", play);

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener("play", function () {
      button.classList.add("hidden");
    });

    video.addEventListener("pause", function () {
      if (video.currentTime === 0 || video.ended) {
        button.classList.remove("hidden");
      }
    });
  };
})();
