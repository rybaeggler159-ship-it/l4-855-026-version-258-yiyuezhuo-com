(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('.movie-player'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var layer = player.querySelector('.play-layer');
    if (!video || !layer) {
      return;
    }

    var source = video.getAttribute('data-video-url');
    var initialized = false;
    var hlsInstance = null;

    function initialize() {
      if (initialized || !source) {
        return;
      }
      initialized = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      initialize();
      video.controls = true;
      layer.classList.add('is-hidden');
      var request = video.play();
      if (request && typeof request.catch === 'function') {
        request.catch(function () {
          layer.classList.remove('is-hidden');
        });
      }
    }

    layer.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
