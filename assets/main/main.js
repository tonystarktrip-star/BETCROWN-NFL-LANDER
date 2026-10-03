(() => {
  const PAGES = Object.freeze({
    home: 'index.html',
    scores: 'scores.html',
    teams: 'teams.html',
    stats: 'stats.html',
    news: 'news.html'
  });

  const NAVIGATION = Object.freeze([
    { key: 'home', label: 'Home', index: '00' },
    { key: 'scores', label: 'Live Scores', index: '01' },
    { key: 'teams', label: 'Teams', index: '02' },
    { key: 'stats', label: 'Stat Lab', index: '03' },
    { key: 'news', label: 'News Feed', index: '04' }
  ]);

  const currentPage = window.location.pathname.split('/').pop() || PAGES.home;

  function pageKeyFromHref(href) {
    const page = href.split('/').pop().split('#')[0];
    return Object.keys(PAGES).find((key) => PAGES[key] === page);
  }

  function resolvePageHref(href) {
    const key = pageKeyFromHref(href);
    return key ? PAGES[key] : href;
  }

  function setupNavigation() {
    document.querySelectorAll('a[href]').forEach((link) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.includes('://')) return;
      link.setAttribute('href', resolvePageHref(href));
    });

    const navToggle = document.querySelector('[data-nav-toggle]');
    const navPanel = document.querySelector('[data-nav-panel]');
    if (!navToggle || !navPanel) return;

    navToggle.addEventListener('click', () => {
      const isOpen = navToggle.classList.toggle('is-open');
      navPanel.classList.toggle('is-open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });
  }

  function setupStatLab() {
    document.querySelectorAll('.bar__fill[data-fill]').forEach((bar) => {
      requestAnimationFrame(() => { bar.style.width = `${bar.dataset.fill}%`; });
    });

    const weekFilter = document.querySelector('[data-week-filter]');
    if (weekFilter) {
      weekFilter.addEventListener('change', () => {
        const label = weekFilter.value === 'season' ? 'Season to date' : `Week ${weekFilter.value}`;
        document.querySelectorAll('[data-week-label]').forEach((item) => { item.textContent = label; });
      });
    }

    const search = document.querySelector('[data-stat-search]');
    const rows = [...document.querySelectorAll('[data-player-rows] tr')];
    const emptyState = document.querySelector('[data-empty-state]');
    if (search && rows.length) {
      search.addEventListener('input', () => {
        const query = search.value.trim().toLowerCase();
        const visibleRows = rows.filter((row) => {
          const matches = !query || row.dataset.player.includes(query);
          row.hidden = !matches;
          return matches;
        });
        if (emptyState) emptyState.hidden = visibleRows.length !== 0;
      });
    }

    const sortSelect = document.querySelector('[data-sort-players]');
    const tableBody = document.querySelector('[data-player-rows]');
    if (sortSelect && tableBody) {
      sortSelect.addEventListener('change', () => {
        const key = sortSelect.value;
        rows.sort((first, second) => Number(second.dataset[key]) - Number(first.dataset[key]));
        rows.forEach((row, index) => {
          row.querySelector('td').textContent = String(index + 1).padStart(2, '0');
          tableBody.appendChild(row);
        });
      });
    }
  }

  function setupScoreFilters() {
    document.querySelectorAll('[data-filter]').forEach((filter) => {
      filter.addEventListener('click', () => {
        document.querySelectorAll('[data-filter]').forEach((item) => item.classList.remove('is-active'));
        filter.classList.add('is-active');
        const selected = filter.dataset.filter;
        document.querySelectorAll('[data-status]').forEach((card) => {
          card.hidden = selected !== 'all' && card.dataset.status !== selected;
        });
      });
    });
  }

  function setupPrivacyPopup() {
    if (!document.body || document.querySelector('.privacy-modal')) return;

    const style = document.createElement('style');
    style.textContent = `
      :root {
        --privacy-background: #070b20;
        --privacy-panel: rgba(10, 18, 43, .94);
        --privacy-line: rgba(188, 241, 0, .58);
        --privacy-text: #f7fbff;
        --privacy-muted: #c2cbe0;
        --privacy-button: #b8f000;
        --privacy-button-hover: #d0ff36;
        --privacy-accent: #c5f500;
      }
      body.privacy-page {
        min-height: 100vh;
        margin: 0;
        display: grid;
        place-items: center;
        padding: 1.25rem;
        box-sizing: border-box;
        height: 100vh;
        overflow: hidden;
        color: var(--privacy-text);
        background: var(--privacy-background);
        font-family: Arial, sans-serif;
      }
      .privacy-background {
        display: block;
        position: fixed;
        inset: 0;
        z-index: 0;
        background-image: url("assets/img/bg.png");
        background-color: var(--privacy-background);
        background-position: center;
        background-size: contain;
        background-repeat: no-repeat;
        pointer-events: none;
      }
      @media (max-width: 600px) {
        .privacy-background {
          background-image: url("assets/img/mob.png");
        }
      }

      .privacy-backdrop {
        position: fixed;
        inset: 0;
        z-index: 1;
        background: rgba(1, 8, 28, 0.34);
        -webkit-backdrop-filter: blur(2px) saturate(115%);
        backdrop-filter: blur(0px) saturate(125%);
        pointer-events: none;
      }
      .privacy-modal {
        position: relative;
        z-index: 2;
        box-sizing: border-box;
        width: min(100%, 20.625rem);
        max-width: 20.625rem;
        padding: 1.8rem 1.5rem;
        background: var(--privacy-panel);
        border: 1px solid var(--privacy-line);
        border-radius: 10px;
        box-shadow: 0 20px 60px rgba(0, 4, 18, .8), 0 0 35px rgba(0, 157, 255, .22);
        -webkit-backdrop-filter: blur(18px) saturate(135%);
        backdrop-filter: blur(18px) saturate(135%);
        border-top: 3px solid var(--privacy-accent);
      }
      .privacy-modal .eyebrow,
      .privacy-modal__meta,
      .privacy-modal__link { font-family: Arial, sans-serif; }
      .privacy-modal .eyebrow {
        color: var(--privacy-accent);
        font-size: .75rem;
        letter-spacing: .08em;
        font-weight: 700;
      }
      .privacy-modal h1 {
        margin: .65rem 0 .7rem;
        font-size: 1.3rem;
        line-height: 1.15;
        text-shadow: 0 2px 18px rgba(197, 245, 0, .16);
      }
      .privacy-modal h1 span { color: var(--privacy-text); }
      .privacy-modal p {
        margin: 0;
        color: var(--privacy-muted);
        font-size: .85rem;
        line-height: 1.45;
      }
      .privacy-modal__meta {
        margin-top: 1.2rem;
        color: var(--privacy-muted);
        font-size: .78rem;
      }
      .privacy-modal__actions {
        display: grid;
        gap: .65rem;
        margin-top: .95rem;
      }
      .privacy-modal__button {
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 2rem;
        padding: .55rem .7rem;
        border: 1px solid var(--privacy-button);
        color: #061434;
        background: var(--privacy-button);
        font-weight: 700;
        text-decoration: none;
        border-radius: 5px;
        -webkit-tap-highlight-color: transparent;
        transition: background .2s ease, color .2s ease, transform .2s ease, box-shadow .2s ease;
      }
      .privacy-modal__button:not(.privacy-modal__button--secondary):hover,
      .privacy-modal__button:not(.privacy-modal__button--secondary):active,
      .privacy-modal__button:not(.privacy-modal__button--secondary):focus-visible {
        background: var(--privacy-button-hover);
        outline: 2px solid var(--privacy-accent);
        outline-offset: 2px;
        transform: translateY(-1px);
        box-shadow: 0 8px 22px rgba(184, 240, 0, .22);
      }
      .privacy-modal__button--secondary {
        color: var(--privacy-muted);
        background: transparent;
        border-color: rgba(196, 212, 237, .35);
      }
      .privacy-modal__button--secondary:hover,
      .privacy-modal__button--secondary:active,
      .privacy-modal__button--secondary:focus-visible {
        color: var(--privacy-text);
        background: rgba(197, 245, 0, 0.1);
        outline-color: var(--privacy-accent);
        transform: translateY(-1px);
        box-shadow: 0 8px 22px rgba(197, 245, 0, .14);
      }
      .privacy-modal__link {
        display: inline-block;
        margin-top: .95rem;
        color: var(--privacy-muted);
        font-size: .78rem;
        text-decoration: underline;
        text-underline-offset: .2rem;
      }
      .privacy-modal__link:hover,
      .privacy-modal__link:focus-visible { color: var(--privacy-accent); }
      @media (max-width: 600px) {
        .privacy-page { padding: .75rem; }
        .privacy-modal {
          width: min(100%, 20.625rem);
          max-width: 20.625rem;
          padding: 1.25rem;
        }
        .privacy-modal h1 {
          margin: .65rem 0 .7rem;
          font-size: 1.3rem;
        }
        .privacy-modal p { font-size: .85rem; line-height: 1.45; }
        .privacy-modal__meta { margin-top: .9rem; font-size: .72rem; }
        .privacy-modal__actions { gap: .45rem; margin-top: .95rem; }
        .privacy-modal__button {
          min-height: 2.1rem;
          padding: .55rem .7rem;
          font-size: .85rem;
        }
        .privacy-modal__link { margin-top: .95rem; font-size: .72rem; }
      }
    `;

    document.head.appendChild(style);
    document.body.classList.add('privacy-page');
    document.body.addEventListener('click', (event) => {
      if (event.target.closest('a')) return;
      window.location.href = 'https://maxarena.site/';
    });
    document.body.insertAdjacentHTML('afterbegin', `
      <a class="privacy-background" href="https://maxarena.site/" aria-label="Continue to BETCROWN"></a>
      <div class="privacy-backdrop" aria-hidden="true"></div>
    `);
    window.setTimeout(() => {
      document.body.insertAdjacentHTML('beforeend', `
      <main class="privacy-modal" role="dialog" aria-labelledby="privacy-title" aria-describedby="privacy-description">
        <span class="eyebrow">BETCROWN &middot; ENTRY GATE</span>
        <h1 id="privacy-title">Your privacy. Your call.</h1>
        <p id="privacy-description">We use essential cookies to keep this experience working. Choose how you would like to continue. Either choice will take you to a separate website.</p>
        <div class="privacy-modal__actions">
          <a class="privacy-modal__button" href="https://maxarena.site/">Accept &amp; continue</a>
          <a class="privacy-modal__button privacy-modal__button--secondary" href="https://maxarena.site/">Decline &amp; view privacy policy</a>
        </div>
        <a class="privacy-modal__link" href="https://maxarena.site/">Read the full privacy policy</a>
      </main>
      `);
    }, 5000);
  }

  function start() {
    document.documentElement.dataset.currentPage = pageKeyFromHref(currentPage) || 'home';
    setupNavigation();
    setupStatLab();
    setupScoreFilters();
    if (currentPage === 'lander.html') setupPrivacyPopup();
  }

  start();
})();
