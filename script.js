/* =====================================================
   25° ANNIVERSARIO — script.js
   Loads data.json, builds timeline, manages panel
   and lightbox.  All state lives here; HTML is static.
   ===================================================== */

(async () => {

  /* ── 1. Load data ── */
  let DATA;
  try {
    const res = await fetch('data.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    DATA = await res.json();
  } catch (e) {
    document.body.innerHTML =
      '<p style="padding:3rem;text-align:center;font-family:sans-serif;color:#c00">' +
      '⚠️ Impossibile caricare data.json. Assicurati che i 4 file siano nella stessa cartella.</p>';
    return;
  }

  const { anniversary: ann, events } = DATA;

  /* ── 2. Category meta ── */
  const CAT = {
    amore:        { label: 'Amore',        color: 'var(--c-amore)' },
    viaggio:      { label: 'Viaggio',      color: 'var(--c-viaggio)' },
    famiglia:     { label: 'Famiglia',     color: 'var(--c-famiglia)' },
    casa:         { label: 'Casa',         color: 'var(--c-casa)' },
    matrimonio:   { label: 'Matrimonio',   color: 'var(--c-matrimonio)' },
    anniversario: { label: 'Anniversario', color: 'var(--c-anniversario)' },
    speciale:     { label: 'Speciale',     color: 'var(--c-speciale)' },
  };

  /* ── 3. Populate Hero ── */
  document.getElementById('hero-num').textContent       = ann.years;
  document.getElementById('hero-names').textContent     = ann.couple;
  document.getElementById('hero-date-start').textContent= 'Dal ' + ann.startDate;
  document.getElementById('hero-ann-date').textContent  = '🎊  ' + ann.anniversaryDate;
  document.getElementById('hero-year-range').textContent= ann.startYear + ' — ' + ann.endYear;
  document.getElementById('footer-names').textContent   = ann.couple;
  document.getElementById('footer-meta').textContent    =
    ann.startYear + ' — ' + ann.endYear + '  ·  ' + ann.years + ' Anni d\'Amore';

  /* ── 4. Hero particles ── */
  const pc = document.getElementById('particles');
  for (let i = 0; i < 44; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 2.5 + 1;
    p.style.cssText =
      `left:${Math.random() * 100}%;` +
      `width:${size}px;height:${size}px;` +
      `animation-duration:${Math.random() * 9 + 6}s;` +
      `animation-delay:${Math.random() * 10}s`;
    pc.appendChild(p);
  }

  /* ── 5. Build Timeline ── */
  const tlEl   = document.getElementById('timeline');
  let lastYear = null;
  let sideIdx  = 0;

  events.forEach(ev => {
    const meta = CAT[ev.category] || CAT.speciale;

    /* Year separator */
    if (ev.year !== lastYear) {
      const yb = document.createElement('div');
      yb.className = 'year-block';
      yb.innerHTML =
        `<div class="year-spacer"></div>` +
        `<div class="year-pill">${ev.year}</div>`;
      tlEl.appendChild(yb);
      lastYear = ev.year;
      sideIdx  = 0; // reset: first event of each year goes left
    }

    const side = (sideIdx % 2 === 0) ? 'left' : 'right';
    sideIdx++;

    const item = document.createElement('div');
    item.className = `tl-item ${side}`;
    item.setAttribute('role', 'listitem');

    item.innerHTML = `
      <div class="card" tabindex="0" role="button"
           aria-label="Apri dettagli: ${ev.title} — ${ev.fullDate}">
        <div class="card-img">
          <img src="${ev.cover}" alt="${ev.title}" loading="lazy"/>
          <div class="card-img-ov"></div>
          <span class="card-cat"  style="background:${meta.color}">${meta.label}</span>
          <span class="card-date">📅 ${ev.fullDate}</span>
          <span class="card-year">${ev.year}</span>
        </div>
        <div class="card-body">
          <div class="card-body-date">📅 ${ev.fullDate}</div>
          <h2 class="card-title">
            <span class="card-emoji">${ev.emoji}</span>${ev.title}
          </h2>
          <p class="card-desc">${ev.description}</p>
          <span class="card-cta">Vedi dettagli</span>
        </div>
      </div>`;

    const card = item.querySelector('.card');
    const open = () => openPanel(ev);
    card.addEventListener('click', open);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
    tlEl.appendChild(item);
  });

  /* ── 6. Scroll reveal (IntersectionObserver) ── */
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.10 });
  document.querySelectorAll('.tl-item').forEach(el => io.observe(el));


  /* ════════════════════════════════════════
     SIDE PANEL
  ════════════════════════════════════════ */
  const panelOverlay = document.getElementById('panel-overlay');
  const panelClose   = document.getElementById('panel-close');
  const panelBody    = document.getElementById('panel-body');

  let currentPhotos = [];
  let lbIdx = 0;

  function openPanel(ev) {
    const meta = CAT[ev.category] || CAT.speciale;
    currentPhotos = ev.photos && ev.photos.length ? ev.photos : [ev.cover];

    /* Top-bar */
    document.getElementById('p-emoji').textContent = ev.emoji;
    document.getElementById('p-year').textContent  = ev.year;
    document.getElementById('p-date').textContent  = ev.fullDate;

    /* Cover */
    const coverImg = document.getElementById('p-cover');
    coverImg.src = ev.cover;
    coverImg.alt = ev.title;
    document.getElementById('p-cover-date').textContent  = '📅 ' + ev.fullDate;
    document.getElementById('p-cover-title').textContent = ev.title;

    const catBadge = document.getElementById('p-cat-badge');
    catBadge.textContent        = meta.label;
    catBadge.style.background   = meta.color;

    /* Date block */
    document.getElementById('p-full-date').textContent = ev.fullDate;

    /* Description */
    document.getElementById('p-desc').textContent = ev.description;

    /* Gallery */
    const gEl = document.getElementById('p-gallery');
    gEl.innerHTML = '';
    currentPhotos.forEach((url, i) => {
      const d = document.createElement('div');
      d.className = 'gphoto';
      d.setAttribute('role', 'button');
      d.setAttribute('tabindex', '0');
      d.setAttribute('aria-label', `Ingrandisci foto ${i + 1}`);
      d.innerHTML =
        `<img src="${url}" alt="Foto ${i + 1} — ${ev.title}" loading="lazy"/>` +
        `<div class="gphoto-ov"><span class="gphoto-zoom">🔍</span></div>`;
      d.addEventListener('click', () => openLightbox(i));
      d.addEventListener('keydown', e => { if (e.key === 'Enter') openLightbox(i); });
      gEl.appendChild(d);
    });

    /* Open */
    panelOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    panelBody.scrollTop = 0;
    panelClose.focus();
  }

  function closePanel() {
    panelOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  panelClose.addEventListener('click', closePanel);
  panelOverlay.addEventListener('click', e => {
    if (e.target === panelOverlay) closePanel();
  });


  /* ════════════════════════════════════════
     LIGHTBOX
  ════════════════════════════════════════ */
  const lb        = document.getElementById('lb');
  const lbImg     = document.getElementById('lb-img');
  const lbCounter = document.getElementById('lb-counter');

  function openLightbox(idx) {
    lbIdx = idx;
    lbImg.src = currentPhotos[lbIdx];
    lbCounter.textContent = (lbIdx + 1) + ' / ' + currentPhotos.length;
    lb.classList.add('open');
  }
  function closeLightbox() { lb.classList.remove('open'); }
  function lbNext() {
    lbIdx = (lbIdx + 1) % currentPhotos.length;
    lbImg.src = currentPhotos[lbIdx];
    lbCounter.textContent = (lbIdx + 1) + ' / ' + currentPhotos.length;
  }
  function lbPrev() {
    lbIdx = (lbIdx - 1 + currentPhotos.length) % currentPhotos.length;
    lbImg.src = currentPhotos[lbIdx];
    lbCounter.textContent = (lbIdx + 1) + ' / ' + currentPhotos.length;
  }

  document.getElementById('lb-close').addEventListener('click', closeLightbox);
  document.getElementById('lb-next').addEventListener('click', lbNext);
  document.getElementById('lb-prev').addEventListener('click', lbPrev);
  lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });

  /* Touch swipe on lightbox */
  let txStart = 0;
  lb.addEventListener('touchstart', e => { txStart = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - txStart;
    if (Math.abs(dx) > 48) { dx < 0 ? lbNext() : lbPrev(); }
  }, { passive: true });

  /* Keyboard */
  document.addEventListener('keydown', e => {
    if (lb.classList.contains('open')) {
      if (e.key === 'ArrowRight') lbNext();
      if (e.key === 'ArrowLeft')  lbPrev();
      if (e.key === 'Escape')     closeLightbox();
      return;
    }
    if (e.key === 'Escape' && panelOverlay.classList.contains('open')) closePanel();
  });

})();