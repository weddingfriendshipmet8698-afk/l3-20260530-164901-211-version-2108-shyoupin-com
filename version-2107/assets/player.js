(function () {
  window.initPlayer = function (videoId, sourceUrl) {
    var video = document.getElementById(videoId);
    if (!video || !sourceUrl) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
    } else {
      video.src = sourceUrl;
    }

    var box = video.closest('.player-box');
    var layer = box ? box.querySelector('.start-layer') : null;
    var button = layer ? layer.querySelector('button') : null;

    function start() {
      if (layer) {
        layer.style.display = 'none';
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', start);
    }

    video.addEventListener('play', function () {
      if (layer) {
        layer.style.display = 'none';
      }
    });
  };
})();
