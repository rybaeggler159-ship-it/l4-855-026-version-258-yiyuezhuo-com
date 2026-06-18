(function () {
  var hlsLibraryPromise = null;
  var hlsLibraryUrl = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";

  function loadHlsLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (hlsLibraryPromise) {
      return hlsLibraryPromise;
    }

    hlsLibraryPromise = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = hlsLibraryUrl;
      script.async = true;
      script.onload = function () {
        if (window.Hls) {
          resolve(window.Hls);
        } else {
          reject(new Error("HLS library loaded without Hls global."));
        }
      };
      script.onerror = function () {
        reject(new Error("Unable to load HLS library."));
      };
      document.head.appendChild(script);
    });

    return hlsLibraryPromise;
  }

  function nativeHlsSupported(video) {
    return Boolean(video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL"));
  }

  function attachNative(video, source) {
    video.src = source;
    return Promise.resolve();
  }

  function attachHls(video, source) {
    return loadHlsLibrary().then(function (Hls) {
      if (Hls.isSupported()) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        video._hlsInstance = hls;
        return;
      }
      video.src = source;
    });
  }

  function preparePlayer(player) {
    var video = player.querySelector("video[data-video-src]");
    var button = player.querySelector("[data-player-start]");

    if (!video || !button) {
      return;
    }

    function startPlayback() {
      var source = video.dataset.videoSrc;
      var setup = video.dataset.ready === "true"
        ? Promise.resolve()
        : nativeHlsSupported(video)
          ? attachNative(video, source)
          : attachHls(video, source);

      setup
        .then(function () {
          video.dataset.ready = "true";
          player.classList.add("is-ready");
          return video.play();
        })
        .catch(function () {
          video.src = source;
          player.classList.add("is-ready");
          video.play().catch(function () {
            button.querySelector("strong").textContent = "点击后请稍候重试";
          });
        });
    }

    button.addEventListener("click", startPlayback);
  }

  function init() {
    document.querySelectorAll("[data-player]").forEach(preparePlayer);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
