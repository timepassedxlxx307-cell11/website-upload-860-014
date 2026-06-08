(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupHeader() {
    var header = document.getElementById("siteHeader");
    var button = document.getElementById("menuButton");
    var nav = document.getElementById("mobileNav");

    function syncHeader() {
      if (!header) {
        return;
      }
      header.classList.toggle("is-scrolled", window.scrollY > 40);
    }

    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });

    if (button && header && nav) {
      button.addEventListener("click", function () {
        var open = !header.classList.contains("open");
        header.classList.toggle("open", open);
        button.setAttribute("aria-expanded", String(open));
      });
    }
  }

  function setupBackToTop() {
    var button = document.getElementById("backToTop");

    if (!button) {
      return;
    }

    function syncButton() {
      button.classList.toggle("visible", window.scrollY > 500);
    }

    syncButton();
    window.addEventListener("scroll", syncButton, { passive: true });
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function setupHero() {
    var slider = document.getElementById("heroSlider");

    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function render(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        render(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        render(dotIndex);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        render(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        render(index + 1);
        start();
      });
    }

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    render(0);
    start();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));

    panels.forEach(function (panel) {
      var section = panel.parentElement;
      var search = panel.querySelector(".card-search");
      var filters = Array.prototype.slice.call(panel.querySelectorAll(".card-filter"));
      var list = section ? section.querySelector("[data-card-list]") : null;
      var cards = list ? Array.prototype.slice.call(list.querySelectorAll(".movie-card")) : Array.prototype.slice.call(document.querySelectorAll(".movie-card"));

      function normalized(value) {
        return String(value || "").toLowerCase().trim();
      }

      function applyFilters() {
        var keyword = normalized(search ? search.value : "");
        var activeFilters = {};

        filters.forEach(function (filter) {
          activeFilters[filter.getAttribute("data-filter")] = normalized(filter.value);
        });

        cards.forEach(function (card) {
          var haystack = normalized([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-year")
          ].join(" "));
          var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchedSelects = Object.keys(activeFilters).every(function (name) {
            var value = activeFilters[name];
            return !value || normalized(card.getAttribute("data-" + name)) === value;
          });
          card.classList.toggle("is-filtered-out", !(matchedKeyword && matchedSelects));
        });
      }

      if (search) {
        search.addEventListener("input", applyFilters);
      }

      filters.forEach(function (filter) {
        filter.addEventListener("change", applyFilters);
      });
    });
  }

  window.setupMoviePlayer = function (source) {
    var video = document.getElementById("movie-video");
    var button = document.getElementById("movie-play-button");
    var message = document.getElementById("movie-player-message");
    var hls = null;
    var loaded = false;

    if (!video || !button || !source) {
      return;
    }

    function setMessage(text) {
      if (message) {
        message.textContent = text || "";
      }
    }

    function hideButton() {
      button.classList.add("is-hidden");
    }

    function showButton() {
      button.classList.remove("is-hidden");
    }

    function loadSource() {
      if (loaded) {
        return;
      }

      loaded = true;

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal && hls) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              setMessage("视频暂时无法播放");
              showButton();
            }
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else {
        setMessage("视频暂时无法播放");
      }
    }

    function startPlayback() {
      setMessage("");
      loadSource();
      hideButton();
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          showButton();
          setMessage("点击播放按钮开始观看");
        });
      }
    }

    button.addEventListener("click", startPlayback);
    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });
    video.addEventListener("play", hideButton);
    video.addEventListener("ended", showButton);
    video.addEventListener("error", function () {
      setMessage("视频暂时无法播放");
      showButton();
    });
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  };

  ready(function () {
    setupHeader();
    setupBackToTop();
    setupHero();
    setupFilters();
  });
})();
