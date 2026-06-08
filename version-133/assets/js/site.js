(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === activeIndex);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === activeIndex);
        });
    }

    dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
            showSlide(dotIndex);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(activeIndex + 1);
        }, 5200);
    }

    function bindSearch(input) {
        var scope = input.closest('main') || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
        var list = scope.querySelector('[data-card-list]');
        var clearButton = input.parentElement ? input.parentElement.querySelector('[data-clear-search]') : null;
        var empty = null;

        function ensureEmpty() {
            if (!empty && list) {
                empty = document.createElement('div');
                empty.className = 'no-results';
                empty.textContent = '没有找到匹配的影片';
                list.appendChild(empty);
            }
        }

        function update() {
            var value = input.value.trim().toLowerCase();
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-type')
                ].join(' ').toLowerCase();
                var matched = !value || haystack.indexOf(value) !== -1;
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });
            if (list) {
                if (visible === 0 && value) {
                    ensureEmpty();
                    empty.style.display = '';
                } else if (empty) {
                    empty.style.display = 'none';
                }
            }
        }

        input.addEventListener('input', update);
        if (clearButton) {
            clearButton.addEventListener('click', function () {
                input.value = '';
                update();
                input.focus();
            });
        }
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-search-input]')).forEach(bindSearch);
}());
