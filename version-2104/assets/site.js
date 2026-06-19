
(function () {
  const data = window.FILMS || [];
  const qs = new URLSearchParams(location.search);
  const page = document.body.dataset.page || '';

  function byId(id) { return document.getElementById(id); }

  function debounce(fn, wait) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function renderCount(el, count) {
    if (!el) return;
    el.textContent = count + ' 条';
  }

  function setupHeroCarousel() {
    const cards = document.querySelectorAll('[data-hero-card]');
    if (!cards.length) return;
    let idx = 0;
    setInterval(() => {
      cards.forEach((c, i) => c.classList.toggle('hide', i !== idx));
      idx = (idx + 1) % cards.length;
    }, 4200);
  }

  function setupFilters() {
    const grid = document.querySelector('[data-filter-grid]');
    const pills = document.querySelectorAll('[data-filter]');
    const search = byId('search-input');
    const resultCount = byId('result-count');
    if (!grid || !pills.length) return;

    function apply() {
      const active = document.querySelector('[data-filter].active');
      const filter = active ? active.dataset.filter : '全部';
      const q = (search && search.value || '').trim().toLowerCase();
      const cards = grid.querySelectorAll('[data-film-card]');
      let visible = 0;
      cards.forEach(card => {
        const hay = (card.dataset.title + ' ' + card.dataset.genre + ' ' + card.dataset.tags + ' ' + card.dataset.category).toLowerCase();
        const okFilter = filter === '全部' || hay.includes(filter.toLowerCase());
        const okQuery = !q || hay.includes(q);
        const show = okFilter && okQuery;
        card.classList.toggle('hide', !show);
        if (show) visible += 1;
      });
      renderCount(resultCount, visible);
    }

    pills.forEach(p => p.addEventListener('click', () => {
      pills.forEach(x => x.classList.remove('active'));
      p.classList.add('active');
      apply();
    }));
    if (search) search.addEventListener('input', debounce(apply, 120));
    apply();
  }

  function setupSearchPage() {
    const root = document.querySelector('[data-search-page]');
    if (!root) return;
    const input = byId('search-input');
    const list = byId('search-results');
    const title = byId('search-title');
    const count = byId('search-count');
    const q = (qs.get('q') || '').trim();
    if (input) input.value = q;

    function render(items) {
      list.innerHTML = items.map(f => `
        <a class="film-card" href="${f.page}" data-film-card data-title="${escapeHtml(f.title)}" data-genre="${escapeHtml(f.genre)}" data-tags="${escapeHtml(f.tags.join(' '))}" data-category="${escapeHtml(f.category)}">
          <div class="poster"><img loading="lazy" src="${f.poster}" alt="${escapeHtml(f.title)} 海报"></div>
          <div class="card-body">
            <h3 class="card-title">${escapeHtml(f.title)}</h3>
            <div class="card-meta"><span>${f.year}</span><span>${escapeHtml(f.category)}</span></div>
            <div class="card-tags">${f.tags.slice(0,3).map(t => `<span class="badge">${escapeHtml(t)}</span>`).join('')}</div>
          </div>
        </a>`).join('');
      if (count) count.textContent = items.length + ' 条';
    }

    function doSearch() {
      const qv = (input ? input.value : q).trim().toLowerCase();
      const res = !qv ? data.slice(0, 120) : data.filter(f => {
        const hay = [f.title, f.genre, f.region, f.category, f.one_line, f.summary, f.review, (f.tags||[]).join(' ')].join(' ').toLowerCase();
        return hay.includes(qv);
      });
      if (title) title.textContent = qv ? `“${qv}” 的搜索结果` : '热门影片浏览';
      render(res.slice(0, 120));
    }
    if (input) input.addEventListener('input', debounce(doSearch, 120));
    doSearch();
  }

  function setupDetailPage() {
    const root = document.querySelector('[data-movie-page]');
    if (!root) return;
    const video = byId('movie-player');
    const buttons = document.querySelectorAll('[data-play-src]');
    if (!video || !buttons.length) return;

    function switchSrc(btn) {
      buttons.forEach(x => x.classList.remove('primary'));
      btn.classList.add('primary');
      const src = btn.dataset.playSrc;
      const type = btn.dataset.type || 'video/mp4';
      const hls = btn.dataset.hls === '1';
      if (window.Hls && hls && src.endsWith('.m3u8')) {
        if (video._hls) { video._hls.destroy(); }
        const hlsInst = new Hls();
        video._hls = hlsInst;
        hlsInst.loadSource(src);
        hlsInst.attachMedia(video);
        hlsInst.on(Hls.Events.MANIFEST_PARSED, function () { video.play().catch(() => {}); });
      } else {
        video.removeAttribute('src');
        video.innerHTML = `<source src="${src}" type="${type}">`;
        video.load();
        video.play().catch(() => {});
      }
    }
    buttons.forEach(btn => btn.addEventListener('click', () => switchSrc(btn)));
    switchSrc(buttons[0]);
  }

  function setupNavSearch() {
    const form = document.querySelector('[data-search-form]');
    const input = byId('search-input');
    if (!form || !input) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = encodeURIComponent(input.value.trim());
      location.href = 'search.html' + (q ? `?q=${q}` : '');
    });
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  setupHeroCarousel();
  setupFilters();
  setupSearchPage();
  setupDetailPage();
  setupNavSearch();
})();
