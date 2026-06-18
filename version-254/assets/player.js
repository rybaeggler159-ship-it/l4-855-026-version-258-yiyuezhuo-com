document.addEventListener('DOMContentLoaded', function () {
  var box = document.querySelector('[data-player]');
  if (!box) {
    return;
  }

  var video = box.querySelector('video');
  var overlay = box.querySelector('[data-overlay]');
  var button = box.querySelector('[data-play]');
  var message = box.querySelector('[data-player-message]');
  var url = box.getAttribute('data-video-url');
  var hls = null;
  var ready = false;

  function showMessage() {
    if (message) {
      message.classList.add('is-visible');
    }
  }

  function hideMessage() {
    if (message) {
      message.classList.remove('is-visible');
    }
  }

  function begin() {
    if (!video || !url) {
      return;
    }

    hideMessage();
    if (overlay) {
      overlay.hidden = true;
    }
    video.controls = true;

    if (!ready) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        ready = true;
        video.play().catch(showMessage);
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          ready = true;
          video.play().catch(showMessage);
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showMessage();
          }
        });
        return;
      }

      video.src = url;
      ready = true;
    }

    video.play().catch(showMessage);
  }

  if (button) {
    button.addEventListener('click', begin);
  }

  if (overlay) {
    overlay.addEventListener('click', begin);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (!ready || video.paused) {
        begin();
      } else {
        video.pause();
      }
    });
  }
});
