(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-nav-toggle]');
    var links = document.querySelector('[data-nav-links]');

    if (toggle && links) {
      toggle.addEventListener('click', function () {
        links.classList.toggle('open');
      });
    }

    var carousel = document.querySelector('[data-hero-carousel]');

    if (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
      var prev = carousel.querySelector('[data-hero-prev]');
      var next = carousel.querySelector('[data-hero-next]');
      var current = 0;
      var timer = null;

      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('active', dotIndex === current);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          show(Number(dot.getAttribute('data-hero-dot')) || 0);
          restart();
        });
      });

      if (prev) {
        prev.addEventListener('click', function () {
          show(current - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(current + 1);
          restart();
        });
      }

      if (slides.length > 1) {
        restart();
      }
    }

    var input = document.getElementById('searchInput');
    var button = document.getElementById('searchButton');
    var results = document.getElementById('searchResults');
    var summary = document.getElementById('searchSummary');

    if (input && button && results && Array.isArray(window.movieSearchData)) {
      var params = new URLSearchParams(window.location.search);
      var initial = params.get('q') || '';
      input.value = initial;

      function card(movie) {
        return [
          '<article class="movie-card">',
          '  <a class="poster-link" href="' + movie.url + '" aria-label="' + escapeHtml(movie.title) + '">',
          '    <img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
          '    <span class="score-badge">' + movie.score + '</span>',
          '  </a>',
          '  <div class="card-body">',
          '    <div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
          '    <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
          '    <p>' + escapeHtml(movie.description) + '</p>',
          '    <div class="mini-tags">' + movie.tags.map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>',
          '  </div>',
          '</article>'
        ].join('');
      }

      function escapeHtml(value) {
        return String(value || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      }

      function performSearch() {
        var query = input.value.trim().toLowerCase();
        var data = window.movieSearchData;
        var matches = query ? data.filter(function (movie) {
          return movie.text.indexOf(query) !== -1;
        }).slice(0, 80) : data.slice(0, 24);

        results.innerHTML = matches.map(card).join('');
        if (summary) {
          summary.textContent = query ? '找到 ' + matches.length + ' 条相关内容' : '热门内容';
        }
      }

      button.addEventListener('click', performSearch);
      input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          performSearch();
        }
      });

      if (initial) {
        performSearch();
      }
    }
  });
})();

function initMoviePlayer(source) {
  var video = document.getElementById('movie-player');
  var button = document.getElementById('movie-play-button');
  var loaded = false;
  var hlsInstance = null;

  if (!video || !source) {
    return;
  }

  function load() {
    if (loaded) {
      return;
    }

    loaded = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls();
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function play() {
    load();
    if (button) {
      button.classList.add('hidden');
    }
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener('click', play);
  }

  video.addEventListener('play', function () {
    if (button) {
      button.classList.add('hidden');
    }
  });

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    } else {
      video.pause();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
