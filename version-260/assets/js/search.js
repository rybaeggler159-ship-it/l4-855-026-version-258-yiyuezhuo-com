document.addEventListener("DOMContentLoaded", function () {
    var form = document.querySelector(".search-panel");
    var input = document.getElementById("search-input");
    var results = document.getElementById("search-results");
    var status = document.getElementById("search-status");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (!form || !input || !results || !status || !Array.isArray(window.SEARCH_INDEX)) {
        return;
    }

    function cardTemplate(movie) {
        var tags = movie.tags.slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");

        return [
            "<a class="movie-card" href="" + escapeHtml(movie.href) + "">",
            "    <span class="poster-wrap">",
            "        <img src="" + escapeHtml(movie.cover) + "" alt="" + escapeHtml(movie.title) + "" loading="lazy">",
            "        <span class="poster-gradient"></span>",
            "        <span class="year-badge">" + escapeHtml(movie.year) + "</span>",
            "    </span>",
            "    <span class="movie-card-body">",
            "        <span class="movie-tags">" + tags + "</span>",
            "        <strong>" + escapeHtml(movie.title) + "</strong>",
            "        <em>" + escapeHtml(movie.oneLine) + "</em>",
            "        <span class="movie-meta"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span><span>" + escapeHtml(movie.genre) + "</span></span>",
            "    </span>",
            "</a>"
        ].join("");
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function render(query) {
        var keyword = query.trim().toLowerCase();
        var matched = window.SEARCH_INDEX.filter(function (movie) {
            var haystack = [
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                movie.oneLine,
                movie.tags.join(" ")
            ].join(" ").toLowerCase();

            return keyword === "" || haystack.includes(keyword);
        }).slice(0, 80);

        status.textContent = keyword === "" ? "输入关键词查找影片" : "搜索结果";
        results.innerHTML = matched.map(cardTemplate).join("");
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        var query = input.value.trim();
        var url = query ? "./search.html?q=" + encodeURIComponent(query) : "./search.html";
        window.history.replaceState(null, "", url);
        render(query);
    });

    input.value = initialQuery;
    render(initialQuery);
});
