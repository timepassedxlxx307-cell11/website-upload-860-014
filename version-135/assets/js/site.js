(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var nav = document.querySelector("[data-site-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var next = slider.querySelector("[data-hero-next]");
        var prev = slider.querySelector("[data-hero-prev]");
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
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
            }, 5200);
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
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }
        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }
        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupFilters() {
        var forms = Array.prototype.slice.call(document.querySelectorAll("[data-movie-filter]"));
        forms.forEach(function (form) {
            var container = form.parentElement;
            var cards = Array.prototype.slice.call(container.querySelectorAll("[data-movie-card]"));
            var query = form.querySelector("[data-filter-query]");
            var year = form.querySelector("[data-filter-year]");
            var region = form.querySelector("[data-filter-region]");
            var type = form.querySelector("[data-filter-type]");
            var empty = container.querySelector("[data-empty-result]");
            var params = new URLSearchParams(window.location.search);
            var queryValue = params.get("q");
            if (query && queryValue) {
                query.value = queryValue;
            }

            function normalize(value) {
                return String(value || "").toLowerCase().trim();
            }

            function matchText(card, keyword) {
                if (!keyword) {
                    return true;
                }
                var text = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre"),
                    card.textContent
                ].join(" ").toLowerCase();
                return text.indexOf(keyword) !== -1;
            }

            function apply() {
                var keyword = normalize(query && query.value);
                var yearValue = normalize(year && year.value);
                var regionValue = normalize(region && region.value);
                var typeValue = normalize(type && type.value);
                var visible = 0;
                cards.forEach(function (card) {
                    var ok = true;
                    ok = ok && matchText(card, keyword);
                    ok = ok && (!yearValue || normalize(card.getAttribute("data-year")) === yearValue);
                    ok = ok && (!regionValue || normalize(card.getAttribute("data-region")).indexOf(regionValue) !== -1);
                    ok = ok && (!typeValue || normalize(card.getAttribute("data-type")).indexOf(typeValue) !== -1);
                    card.classList.toggle("is-hidden", !ok);
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [query, year, region, type].forEach(function (element) {
                if (!element) {
                    return;
                }
                element.addEventListener("input", apply);
                element.addEventListener("change", apply);
            });

            form.addEventListener("submit", function (event) {
                if (cards.length) {
                    event.preventDefault();
                    apply();
                }
            });
            apply();
        });
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupFilters();
    });
})();
