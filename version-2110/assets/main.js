(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector(".menu-button");
    var mobileNav = document.querySelector(".mobile-nav");
    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
      });
    }

    var carousel = document.querySelector("[data-carousel]");
    if (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
      var prev = carousel.querySelector(".hero-prev");
      var next = carousel.querySelector(".hero-next");
      var current = 0;
      var timer;

      function show(index) {
        if (!slides.length) return;
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === current);
        });
      }

      function restart() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5000);
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-slide")) || 0);
          restart();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          restart();
        });
      }

      show(0);
      restart();
    }

    var params = new URLSearchParams(window.location.search);
    var queryValue = params.get("q") || "";
    var globalSearch = document.getElementById("globalSearch");
    if (globalSearch && queryValue) {
      globalSearch.value = queryValue;
    }

    var filterScope = document.querySelector(".filter-scope");
    if (filterScope) {
      var cards = Array.prototype.slice.call(filterScope.querySelectorAll(".movie-card"));
      var searchInput = document.querySelector(".local-search");
      var typeFilter = document.querySelector(".type-filter");
      var yearFilter = document.querySelector(".year-filter");

      function applyFilter() {
        var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
        var typeVal = typeFilter ? typeFilter.value : "";
        var yearVal = yearFilter ? yearFilter.value : "";

        cards.forEach(function (card) {
          var text = card.textContent.toLowerCase() + " " + (card.getAttribute("data-title") || "").toLowerCase() + " " + (card.getAttribute("data-region") || "").toLowerCase() + " " + (card.getAttribute("data-category") || "").toLowerCase();
          var cardType = card.getAttribute("data-type") || "";
          var cardYear = card.getAttribute("data-year") || "";
          var matchKeyword = !keyword || text.indexOf(keyword) >= 0;
          var matchType = !typeVal || cardType.indexOf(typeVal) >= 0;
          var matchYear = !yearVal || cardYear === yearVal;
          card.classList.toggle("hidden-by-filter", !(matchKeyword && matchType && matchYear));
        });
      }

      [searchInput, typeFilter, yearFilter].forEach(function (el) {
        if (el) {
          el.addEventListener("input", applyFilter);
          el.addEventListener("change", applyFilter);
        }
      });

      applyFilter();
    }

    Array.prototype.slice.call(document.querySelectorAll(".movie-player")).forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector(".play-layer");
      if (!video || !button) return;
      var src = video.getAttribute("data-src");
      var bound = false;

      function bind() {
        if (bound || !src) return;
        bound = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(src);
          hls.attachMedia(video);
        } else {
          video.src = src;
        }
      }

      function play() {
        bind();
        button.classList.add("hide");
        video.controls = true;
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            button.classList.remove("hide");
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
        button.classList.add("hide");
      });
    });
  });
})();
