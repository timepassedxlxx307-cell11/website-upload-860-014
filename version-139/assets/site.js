(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-menu]');
  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var setSlide = function (next) {
      if (!slides.length) return;
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        setSlide(i);
      });
    });
    window.setInterval(function () {
      setSlide(index + 1);
    }, 5200);
  }

  var grids = Array.prototype.slice.call(document.querySelectorAll('[data-library-grid]'));
  grids.forEach(function (grid) {
    var scope = grid.parentElement || document;
    var input = scope.querySelector('[data-library-search]');
    var year = scope.querySelector('[data-year-filter]');
    var type = scope.querySelector('[data-type-filter]');
    var region = scope.querySelector('[data-region-filter]');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    if (input && q) {
      input.value = q;
    }
    var normalize = function (value) {
      return (value || '').toString().trim().toLowerCase();
    };
    var apply = function () {
      var needle = normalize(input && input.value);
      var yearValue = normalize(year && year.value);
      var typeValue = normalize(type && type.value);
      var regionValue = normalize(region && region.value);
      cards.forEach(function (card) {
        var hay = normalize(card.getAttribute('data-search'));
        var ok = true;
        if (needle && hay.indexOf(needle) === -1) ok = false;
        if (yearValue && normalize(card.getAttribute('data-year')) !== yearValue) ok = false;
        if (typeValue && normalize(card.getAttribute('data-type')) !== typeValue) ok = false;
        if (regionValue && normalize(card.getAttribute('data-region')) !== regionValue) ok = false;
        card.style.display = ok ? '' : 'none';
      });
    };
    [input, year, type, region].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
    apply();
  });

  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
  players.forEach(function (box) {
    var video = box.querySelector('video');
    var button = box.querySelector('[data-play-button]');
    var message = box.querySelector('[data-player-message]');
    var engine = null;
    var ready = false;
    var starting = false;
    if (!video || !button) return;
    var playNow = function () {
      var result = video.play();
      box.classList.add('is-playing');
      if (result && result.catch) {
        result.catch(function () {
          box.classList.remove('is-playing');
          if (message) message.textContent = '点击视频继续播放';
        });
      }
    };
    var prepare = function () {
      if (ready) {
        playNow();
        return;
      }
      if (starting) return;
      starting = true;
      if (message) message.textContent = '';
      var playUrl = video.getAttribute('data-play');
      if (!playUrl) return;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = playUrl;
        ready = true;
        playNow();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        engine = new window.Hls({ enableWorker: true, lowLatencyMode: false });
        engine.loadSource(playUrl);
        engine.attachMedia(video);
        engine.on(window.Hls.Events.MANIFEST_PARSED, function () {
          ready = true;
          playNow();
        });
        engine.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            if (message) message.textContent = '视频加载失败，请稍后重试';
            if (engine) engine.destroy();
            engine = null;
            ready = false;
            starting = false;
          }
        });
        return;
      }
      video.src = playUrl;
      ready = true;
      playNow();
    };
    button.addEventListener('click', prepare);
    video.addEventListener('click', function () {
      if (!ready) prepare();
    });
    video.addEventListener('play', function () {
      box.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      if (!video.currentTime) box.classList.remove('is-playing');
    });
    video.addEventListener('error', function () {
      if (message) message.textContent = '视频加载失败，请稍后重试';
    });
  });
})();
