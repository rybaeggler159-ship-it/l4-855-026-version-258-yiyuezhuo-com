(function () {
  document.querySelectorAll('.player-shell').forEach(function (root) {
    var video = root.querySelector('video');
    var overlay = root.querySelector('.player-overlay');
    var source = root.getAttribute('data-hls-src');
    var hls = null;
    var attached = false;

    function attach() {
      if (attached || !video || !source) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: false });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      attach();
      root.classList.add('is-playing');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          root.classList.remove('is-playing');
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('play', function () {
        root.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (!video.seeking && video.currentTime === 0) {
          root.classList.remove('is-playing');
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  });
})();
