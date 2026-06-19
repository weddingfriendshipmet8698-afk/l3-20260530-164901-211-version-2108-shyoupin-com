(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function uniqueSorted(items, key) {
        var values = [];
        var seen = Object.create(null);
        items.forEach(function (item) {
            var value = item[key];
            if (value && !seen[value]) {
                seen[value] = true;
                values.push(value);
            }
        });
        return values.sort(function (a, b) {
            return String(b).localeCompare(String(a), 'zh-CN');
        });
    }

    function fillSelect(select, values) {
        values.forEach(function (value) {
            var option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    function cardTemplate(movie) {
        return [
            '<article class="movie-card">',
            '  <a href="movie/' + movie.detail + '" class="movie-cover" aria-label="观看 ' + escapeHtml(movie.title) + '">',
            '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '    <span class="card-play" aria-hidden="true">▶</span>',
            '    <span class="card-year">' + escapeHtml(movie.year) + '</span>',
            '  </a>',
            '  <div class="movie-info">',
            '    <div class="movie-meta-line"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
            '    <h3><a href="movie/' + movie.detail + '">' + escapeHtml(movie.title) + '</a></h3>',
            '    <p>' + escapeHtml(movie.oneLine) + '</p>',
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
            .replace(/'/g, '&#039;');
    }

    ready(function () {
        var movies = window.SITE_MOVIES || [];
        var input = document.querySelector('[data-site-search]');
        var results = document.querySelector('[data-search-results]');
        var count = document.querySelector('[data-search-count]');
        var regionSelect = document.querySelector('[data-region-filter]');
        var typeSelect = document.querySelector('[data-type-filter]');
        var yearSelect = document.querySelector('[data-year-filter]');

        if (!input || !results || !count) {
            return;
        }

        fillSelect(regionSelect, uniqueSorted(movies, 'region'));
        fillSelect(typeSelect, uniqueSorted(movies, 'type'));
        fillSelect(yearSelect, uniqueSorted(movies, 'year'));

        function applySearch() {
            var query = normalize(input.value);
            var region = regionSelect.value;
            var type = typeSelect.value;
            var year = yearSelect.value;
            var matched = movies.filter(function (movie) {
                var haystack = normalize([
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.tags,
                    movie.oneLine
                ].join(' '));
                if (query && haystack.indexOf(query) === -1) {
                    return false;
                }
                if (region && movie.region !== region) {
                    return false;
                }
                if (type && movie.type !== type) {
                    return false;
                }
                if (year && movie.year !== year) {
                    return false;
                }
                return true;
            });
            count.textContent = '找到 ' + matched.length + ' 部视频，当前显示前 120 部。';
            results.innerHTML = matched.slice(0, 120).map(cardTemplate).join('');
        }

        input.addEventListener('input', applySearch);
        regionSelect.addEventListener('change', applySearch);
        typeSelect.addEventListener('change', applySearch);
        yearSelect.addEventListener('change', applySearch);
        applySearch();
    });
}());
