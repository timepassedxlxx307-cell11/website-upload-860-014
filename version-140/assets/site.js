(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    const button = document.querySelector('[data-menu-toggle]');
    const nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', () => {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    const hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) {
      return;
    }
    let index = 0;
    let timer = null;
    const setSlide = next => {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, current) => {
        slide.classList.toggle('is-active', current === index);
      });
      dots.forEach((dot, current) => {
        dot.classList.toggle('is-active', current === index);
      });
    };
    const start = () => {
      clearInterval(timer);
      timer = setInterval(() => setSlide(index + 1), 5600);
    };
    dots.forEach((dot, current) => {
      dot.addEventListener('click', () => {
        setSlide(current);
        start();
      });
    });
    start();
  }

  function initFilters() {
    const scopes = Array.from(document.querySelectorAll('.filter-scope'));
    if (!scopes.length) {
      return;
    }
    const input = document.querySelector('.site-filter-input');
    const typeSelect = document.querySelector('.site-filter-select');
    const categorySelect = document.querySelector('.site-category-select');
    const result = document.querySelector('[data-filter-result]');
    const filter = () => {
      const term = (input && input.value ? input.value : '').trim().toLowerCase();
      const selectedType = typeSelect && typeSelect.value ? typeSelect.value : '';
      const selectedCategory = categorySelect && categorySelect.value ? categorySelect.value : '';
      let visible = 0;
      scopes.forEach(scope => {
        const cards = scope.querySelectorAll('.movie-card, .rank-item');
        cards.forEach(card => {
          const haystack = (card.dataset.search || card.textContent || '').toLowerCase();
          const type = card.dataset.type || '';
          const category = card.dataset.category || '';
          const matchTerm = !term || haystack.includes(term);
          const matchType = !selectedType || type === selectedType;
          const matchCategory = !selectedCategory || category === selectedCategory;
          const show = matchTerm && matchType && matchCategory;
          card.classList.toggle('is-filtered', !show);
          if (show) {
            visible += 1;
          }
        });
      });
      if (result) {
        if (term || selectedType || selectedCategory) {
          result.textContent = `找到 ${visible} 部影片`;
        } else {
          result.textContent = '';
        }
      }
    };
    [input, typeSelect, categorySelect].forEach(element => {
      if (element) {
        element.addEventListener('input', filter);
        element.addEventListener('change', filter);
      }
    });
  }

  window.initializePlayer = function (options) {
    const video = options && options.video;
    const button = options && options.button;
    const source = options && options.source;
    if (!video || !button || !source) {
      return;
    }
    let attached = false;
    let hls = null;
    const attach = () => {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    };
    const start = () => {
      attach();
      button.classList.add('is-hidden');
      video.setAttribute('controls', 'controls');
      const play = video.play();
      if (play && typeof play.catch === 'function') {
        play.catch(() => {});
      }
    };
    button.addEventListener('click', start);
    video.addEventListener('click', () => {
      if (!attached) {
        start();
      }
    });
    window.addEventListener('pagehide', () => {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  };

  ready(() => {
    initMenu();
    initHero();
    initFilters();
  });
})();
