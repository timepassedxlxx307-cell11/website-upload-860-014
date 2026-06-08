(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var header = document.querySelector("[data-site-header]");
        var navToggle = document.querySelector("[data-nav-toggle]");
        var navMenu = document.querySelector("[data-nav-menu]");

        function updateHeader() {
            if (!header) {
                return;
            }
            if (window.scrollY > 32) {
                header.classList.add("is-scrolled");
            } else {
                header.classList.remove("is-scrolled");
            }
        }

        updateHeader();
        window.addEventListener("scroll", updateHeader, { passive: true });

        if (navToggle && navMenu && header) {
            navToggle.addEventListener("click", function () {
                navMenu.classList.toggle("is-open");
                header.classList.toggle("is-open");
                document.body.classList.toggle("nav-open");
            });
        }

        setupHero();
        setupFilters();
    });

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var minis = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-mini]"));
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
            minis.forEach(function (mini, miniIndex) {
                mini.classList.toggle("is-active", miniIndex === current);
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

        minis.forEach(function (mini, index) {
            mini.addEventListener("mouseenter", function () {
                show(index);
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));

        scopes.forEach(function (scope) {
            var input = scope.querySelector("[data-filter-search]");
            var type = scope.querySelector("[data-filter-type]");
            var year = scope.querySelector("[data-filter-year]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));

            function update() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var typeValue = type ? type.value : "";
                var yearValue = year ? year.value : "";

                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-tags")
                    ].join(" ").toLowerCase();
                    var matchQuery = !query || haystack.indexOf(query) !== -1;
                    var matchType = !typeValue || card.getAttribute("data-type") === typeValue;
                    var matchYear = !yearValue || card.getAttribute("data-year") === yearValue;
                    card.hidden = !(matchQuery && matchType && matchYear);
                });
            }

            if (input) {
                input.addEventListener("input", update);
            }
            if (type) {
                type.addEventListener("change", update);
            }
            if (year) {
                year.addEventListener("change", update);
            }
        });
    }
})();

function setupMoviePlayer(playerId, videoSource) {
    var shell = document.getElementById(playerId);
    if (!shell) {
        return;
    }

    var video = shell.querySelector("video");
    var overlay = shell.querySelector(".player-overlay");
    var initialized = false;
    var hlsInstance = null;

    function attachSource() {
        if (!video || initialized) {
            return;
        }

        initialized = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = videoSource;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(videoSource);
            hlsInstance.attachMedia(video);
        } else {
            video.src = videoSource;
        }
    }

    function playVideo() {
        attachSource();
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
                if (overlay) {
                    overlay.classList.remove("is-hidden");
                }
            });
        }
    }

    if (overlay) {
        overlay.addEventListener("click", playVideo);
    }

    if (video) {
        video.addEventListener("click", function () {
            if (video.paused) {
                playVideo();
            }
        });
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
        video.addEventListener("pause", function () {
            if (video.currentTime === 0 && overlay) {
                overlay.classList.remove("is-hidden");
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }
}
