(function () {
  var hlsScriptUrl = "https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js";
  var hlsLoading = false;
  var hlsCallbacks = [];

  document.addEventListener("DOMContentLoaded", function () {
    initMobileNav();
    initHero();
    initSearch();
    initPlayer();
  });

  function initMobileNav() {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-mobile-nav]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    function next() {
      show(current + 1);
    }

    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(next, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        play();
      });
    });

    play();
  }

  function initSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var filters = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
    var empty = document.querySelector("[data-empty-state]");
    if (!cards.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var queryFromUrl = params.get("q") || "";
    var state = {
      text: queryFromUrl.trim().toLowerCase(),
      filter: "all"
    };

    inputs.forEach(function (input) {
      input.value = queryFromUrl;
      input.addEventListener("input", function () {
        state.text = input.value.trim().toLowerCase();
        applyFilters(cards, state, empty);
      });
    });

    filters.forEach(function (button) {
      button.addEventListener("click", function () {
        filters.forEach(function (item) {
          item.classList.remove("active");
        });
        button.classList.add("active");
        state.filter = button.getAttribute("data-filter") || "all";
        applyFilters(cards, state, empty);
      });
    });

    applyFilters(cards, state, empty);
  }

  function applyFilters(cards, state, empty) {
    var visible = 0;
    cards.forEach(function (card) {
      var text = [
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-year")
      ].join(" ").toLowerCase();
      var type = (card.getAttribute("data-type") || "").toLowerCase();
      var region = (card.getAttribute("data-region") || "").toLowerCase();
      var genre = (card.getAttribute("data-genre") || "").toLowerCase();
      var matchesText = !state.text || text.indexOf(state.text) !== -1;
      var filter = state.filter.toLowerCase();
      var matchesFilter = filter === "all" || text.indexOf(filter) !== -1;

      if (filter === "国产") {
        matchesFilter = region.indexOf("中国") !== -1 || region.indexOf("大陆") !== -1 || text.indexOf("国产") !== -1;
      }
      if (filter === "海外") {
        matchesFilter = !(region.indexOf("中国") !== -1 || region.indexOf("大陆") !== -1);
      }
      if (filter === "动画") {
        matchesFilter = type.indexOf("动画") !== -1 || genre.indexOf("动画") !== -1 || genre.indexOf("动漫") !== -1;
      }

      var show = matchesText && matchesFilter;
      card.style.display = show ? "" : "none";
      if (show) {
        visible += 1;
      }
    });
    if (empty) {
      empty.classList.toggle("show", visible === 0);
    }
  }

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    hlsCallbacks.push(callback);
    if (hlsLoading) {
      return;
    }
    hlsLoading = true;
    var script = document.createElement("script");
    script.src = hlsScriptUrl;
    script.onload = function () {
      hlsLoading = false;
      hlsCallbacks.splice(0).forEach(function (item) {
        item();
      });
    };
    script.onerror = function () {
      hlsLoading = false;
      hlsCallbacks.splice(0).forEach(function (item) {
        item();
      });
    };
    document.head.appendChild(script);
  }

  function initPlayer() {
    var box = document.querySelector("[data-player]");
    if (!box) {
      return;
    }
    var video = box.querySelector("video");
    var overlay = box.querySelector("[data-player-overlay]");
    var message = box.querySelector("[data-player-message]");
    var started = false;
    var hlsInstance = null;
    var stream = typeof window.activeStream === "string" ? window.activeStream : "";

    function setMessage(text) {
      if (message) {
        message.textContent = text || "";
      }
    }

    function attachAndPlay() {
      if (!video || !stream) {
        setMessage("播放加载失败，请稍后重试");
        return;
      }
      if (started) {
        video.play();
        return;
      }
      started = true;
      if (overlay) {
        overlay.classList.add("hidden");
      }
      video.controls = true;
      video.crossOrigin = "anonymous";

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        video.play().catch(function () {
          setMessage("点击视频区域继续播放");
        });
        return;
      }

      loadHls(function () {
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {
              setMessage("点击视频区域继续播放");
            });
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setMessage("播放加载失败，请稍后重试");
              if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
              }
            }
          });
        } else {
          video.src = stream;
          video.play().catch(function () {
            setMessage("点击视频区域继续播放");
          });
        }
      });
    }

    if (overlay) {
      overlay.addEventListener("click", attachAndPlay);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (!started) {
          attachAndPlay();
          return;
        }
        if (video.paused) {
          video.play();
        } else {
          video.pause();
        }
      });
      video.addEventListener("play", function () {
        setMessage("");
      });
    }
  }
})();
