(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function createPlayer(source) {
        var video = document.getElementById("movie-player");
        var button = document.getElementById("play-trigger");
        if (!video || !button || !source) {
            return;
        }
        var hls = null;
        var attached = false;
        var manifestReady = false;

        function attach(done) {
            if (attached) {
                done();
                return;
            }
            attached = true;
            video.setAttribute("controls", "controls");
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                manifestReady = true;
                done();
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 60
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    manifestReady = true;
                    done();
                });
                window.setTimeout(function () {
                    if (!manifestReady) {
                        done();
                    }
                }, 900);
                return;
            }
            video.src = source;
            manifestReady = true;
            done();
        }

        function play() {
            button.classList.add("is-hidden");
            attach(function () {
                var action = video.play();
                if (action && typeof action.catch === "function") {
                    action.catch(function () {
                        button.classList.remove("is-hidden");
                    });
                }
            });
        }

        button.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (!attached || video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            button.classList.add("is-hidden");
        });
        video.addEventListener("ended", function () {
            button.classList.remove("is-hidden");
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    }

    window.MoviePlayer = {
        init: function (source) {
            ready(function () {
                createPlayer(source);
            });
        }
    };
})();
