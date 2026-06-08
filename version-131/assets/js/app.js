(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function toggleMenus() {
    var button = document.querySelector("[data-menu-toggle]");
    var links = document.querySelector("[data-nav-links]");
    var search = document.querySelector(".header-search");

    if (!button || !links || !search) {
      return;
    }

    button.addEventListener("click", function () {
      links.classList.toggle("is-open");
      search.classList.toggle("is-open");
    });
  }

  function searchBox() {
    var inputs = document.querySelectorAll("[data-search-input]");

    inputs.forEach(function (input) {
      var results = input.parentElement.querySelector("[data-search-results]");

      if (!results || typeof SEARCH_INDEX === "undefined") {
        return;
      }

      input.addEventListener("input", function () {
        var query = input.value.trim().toLowerCase();
        results.innerHTML = "";

        if (!query) {
          results.classList.remove("is-open");
          return;
        }

        var found = SEARCH_INDEX.filter(function (item) {
          return item.text.toLowerCase().indexOf(query) !== -1;
        }).slice(0, 12);

        found.forEach(function (item) {
          var link = document.createElement("a");
          link.className = "search-result-item";
          link.href = item.url;
          link.innerHTML = "<strong>" + item.title + "</strong><span>" + item.category + " · " + item.year + " · " + item.genre + "</span>";
          results.appendChild(link);
        });

        results.classList.toggle("is-open", found.length > 0);
      });

      document.addEventListener("click", function (event) {
        if (!input.parentElement.contains(event.target)) {
          results.classList.remove("is-open");
        }
      });
    });
  }

  function heroSlider() {
    var slider = document.querySelector("[data-hero-slider]");

    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-slide-dot]"));
    var prev = document.querySelector("[data-slide-prev]");
    var next = document.querySelector("[data-slide-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 6200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

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

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    start();
  }

  function catalogFilter() {
    var pages = document.querySelectorAll("[data-catalog]");

    pages.forEach(function (page) {
      var search = page.querySelector("[data-catalog-search]");
      var year = page.querySelector("[data-catalog-year]");
      var type = page.querySelector("[data-catalog-type]");
      var cards = Array.prototype.slice.call(page.querySelectorAll("[data-card]"));
      var empty = page.querySelector("[data-empty]");

      function apply() {
        var query = search ? search.value.trim().toLowerCase() : "";
        var yearValue = year ? year.value : "";
        var typeValue = type ? type.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var matchesQuery = !query || card.dataset.text.toLowerCase().indexOf(query) !== -1;
          var matchesYear = !yearValue || card.dataset.year === yearValue;
          var matchesType = !typeValue || card.dataset.type === typeValue;
          var show = matchesQuery && matchesYear && matchesType;
          card.style.display = show ? "" : "none";

          if (show) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-open", visible === 0);
        }
      }

      [search, year, type].forEach(function (node) {
        if (node) {
          node.addEventListener("input", apply);
          node.addEventListener("change", apply);
        }
      });
    });
  }

  ready(function () {
    toggleMenus();
    searchBox();
    heroSlider();
    catalogFilter();
  });
})();

window.initPlayer = function (streamUrl) {
  var video = document.querySelector("[data-player]");
  var cover = document.querySelector("[data-play-cover]");

  if (!video || !streamUrl) {
    return;
  }

  var mounted = false;
  var hls = null;

  function hideCover() {
    if (cover) {
      cover.classList.add("is-hidden");
    }
  }

  function playVideo() {
    hideCover();
    var promise = video.play();

    if (promise && promise.catch) {
      promise.catch(function () {});
    }
  }

  function mount(autoplay) {
    if (mounted) {
      if (autoplay) {
        playVideo();
      }
      return;
    }

    mounted = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      if (autoplay) {
        playVideo();
      }
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        if (autoplay) {
          playVideo();
        }
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
          video.src = streamUrl;
        }
      });
      return;
    }

    video.src = streamUrl;
    if (autoplay) {
      playVideo();
    }
  }

  if (cover) {
    cover.addEventListener("click", function () {
      mount(true);
    });
  }

  video.addEventListener("click", function () {
    if (!mounted) {
      mount(true);
    }
  });

  video.addEventListener("play", hideCover);
};
