(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function isHlsSource(source) {
        return /\.m3u8(\?|$)/i.test(source || '');
    }

    function attachSource(video, source, messageElement) {
        if (!source) {
            messageElement.textContent = '未找到播放源。';
            return;
        }

        if (isHlsSource(source)) {
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    messageElement.textContent = 'HLS 播放源已就绪';
                });
                hls.on(window.Hls.Events.ERROR, function (eventName, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        messageElement.textContent = '网络异常，正在重新加载播放源。';
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        messageElement.textContent = '媒体异常，正在尝试恢复播放。';
                        hls.recoverMediaError();
                    } else {
                        messageElement.textContent = '播放器初始化失败，请刷新页面重试。';
                        hls.destroy();
                    }
                });
                video._hlsInstance = hls;
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                messageElement.textContent = '使用浏览器原生 HLS 播放能力。';
                return;
            }

            messageElement.textContent = '当前浏览器不支持 HLS 播放。';
            return;
        }

        video.src = source;
        messageElement.textContent = 'MP4 播放源已就绪';
    }

    function setupPlayer(root) {
        var video = root.querySelector('video');
        var message = root.querySelector('[data-player-message]');
        var toggleButtons = root.querySelectorAll('[data-player-toggle]');
        var muteButton = root.querySelector('[data-player-mute]');
        var fullscreenButton = root.querySelector('[data-player-fullscreen]');
        var source = root.getAttribute('data-source');
        var poster = root.getAttribute('data-poster');

        if (!video || !message) {
            return;
        }

        if (poster) {
            video.poster = poster;
        }
        video.controls = true;
        attachSource(video, source, message);

        function updateState() {
            root.classList.toggle('is-playing', !video.paused);
            root.classList.toggle('is-paused', video.paused);
        }

        function togglePlayback() {
            if (video.paused) {
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        message.textContent = '浏览器阻止了自动播放，请再次点击播放按钮。';
                    });
                }
            } else {
                video.pause();
            }
        }

        Array.prototype.forEach.call(toggleButtons, function (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                togglePlayback();
            });
        });

        video.addEventListener('click', togglePlayback);
        video.addEventListener('play', updateState);
        video.addEventListener('pause', updateState);
        video.addEventListener('ended', updateState);

        if (muteButton) {
            muteButton.addEventListener('click', function () {
                video.muted = !video.muted;
                muteButton.textContent = video.muted ? '取消静音' : '静音';
            });
        }

        if (fullscreenButton) {
            fullscreenButton.addEventListener('click', function () {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else if (root.requestFullscreen) {
                    root.requestFullscreen();
                }
            });
        }

        updateState();
    }

    ready(function () {
        var players = document.querySelectorAll('[data-video-player]');
        Array.prototype.forEach.call(players, setupPlayer);
    });
}());
