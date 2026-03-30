(async () => {
  /* ── Load data ── */
  let DATA;
  try {
    const res = await fetch("data.json");
    DATA = await res.json();
  } catch (e) {
    console.error("Errore caricamento data.json");
    return;
  }

  const { anniversary: ann, events } = DATA;

  /* ── Populate header / hero ── */
  document.getElementById("nav-couple").textContent  = ann.couple;
  document.getElementById("hero-couple").textContent = ann.couple;
  document.getElementById("hero-dates").textContent  = `${ann.startDate} — ${ann.anniversaryDate}`;

  /* ── Build timeline ── */
  const tlEvents = document.getElementById("tl-events");

  events.forEach((ev, i) => {
    const side = i % 2 === 0 ? "left" : "right";
    const el   = document.createElement("div");
    el.className = `tl-event ${side}`;

    const cardHTML = `
      <div class="tl-card" role="button" tabindex="0" aria-label="Apri ${ev.title}">
        <div class="tl-card-img-wrap">
          <img class="tl-card-img" src="${ev.cover}" alt="${ev.title}" loading="lazy" />
        </div>
        <div class="tl-card-body">
          <div class="tl-card-meta">
            <span class="tl-card-date">${ev.day} ${ev.month}</span>
            <span class="tl-card-emoji" aria-hidden="true">${ev.emoji}</span>
          </div>
          <h3 class="tl-card-title">${ev.title}</h3>
          <p class="tl-card-excerpt">${ev.description.substring(0, 80)}…</p>
          <span class="tl-card-cta">Scopri →</span>
        </div>
      </div>`;

    const nodeHTML = `
      <div class="tl-node">
        <div class="tl-dot"></div>
        <span class="tl-node-year">${ev.year}</span>
      </div>`;

    if (side === "left") {
      el.innerHTML = cardHTML + nodeHTML + `<div class="tl-spacer"></div>`;
    } else {
      el.innerHTML = `<div class="tl-spacer"></div>` + nodeHTML + cardHTML;
    }

    const card = el.querySelector(".tl-card");
    const open = () => openModal(ev);
    card.addEventListener("click",  open);
    card.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") open(); });

    tlEvents.appendChild(el);
  });

  /* ── Intersection Observer for scroll-reveal ── */
  const io = new IntersectionObserver(
    entries => entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add("visible"); io.unobserve(en.target); }
    }),
    { threshold: 0.12 }
  );
  document.querySelectorAll(".tl-event").forEach(el => io.observe(el));

  /* ── Modal ── */
  const backdrop   = document.getElementById("modal-backdrop");
  const modalEl    = document.getElementById("modal");
  let currentPhotos = [];
  let lbIdx = 0;

  function openModal(ev) {
    document.getElementById("modal-cover").src        = ev.cover;
    document.getElementById("modal-cover").alt        = ev.title;
    document.getElementById("modal-date").textContent  = `${ev.fullDate} · ${ev.year}`;
    document.getElementById("modal-title").textContent = ev.title;
    document.getElementById("modal-desc").textContent  = ev.description;
    document.getElementById("modal-cat").textContent   = ev.category || "";

    const gallery = document.getElementById("modal-gallery");
    gallery.innerHTML = "";
    currentPhotos = ev.photos || [];
    currentPhotos.forEach((url, i) => {
      const img = document.createElement("img");
      img.src = url;
      img.alt = `${ev.title} — foto ${i + 1}`;
      img.loading = "lazy";
      img.addEventListener("click", e => { e.stopPropagation(); openLightbox(i); });
      gallery.appendChild(img);
    });

    backdrop.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    backdrop.classList.remove("open");
    document.body.style.overflow = "";
  }

  document.getElementById("modal-close").addEventListener("click", closeModal);
  backdrop.addEventListener("click", e => { if (e.target === backdrop) closeModal(); });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") { closeModal(); closeLightbox(); }
  });

  /* ── Lightbox ── */
  const lb = document.getElementById("lb");

  function openLightbox(i) {
    lbIdx = i;
    document.getElementById("lb-img").src = currentPhotos[lbIdx];
    lb.style.display = "flex";
  }
  function closeLightbox() { lb.style.display = "none"; }

  document.getElementById("lb-close").addEventListener("click", closeLightbox);
  document.getElementById("lb-next").addEventListener("click", e => {
    e.stopPropagation();
    lbIdx = (lbIdx + 1) % currentPhotos.length;
    document.getElementById("lb-img").src = currentPhotos[lbIdx];
  });
  document.getElementById("lb-prev").addEventListener("click", e => {
    e.stopPropagation();
    lbIdx = (lbIdx - 1 + currentPhotos.length) % currentPhotos.length;
    document.getElementById("lb-img").src = currentPhotos[lbIdx];
  });
  lb.addEventListener("click", e => { if (e.target === lb || e.target.tagName !== "IMG") closeLightbox(); });

  /* ── Swipe support for lightbox on mobile ── */
  let touchX = null;
  lb.addEventListener("touchstart", e => { touchX = e.changedTouches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", e => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) {
      lbIdx = dx < 0
        ? (lbIdx + 1) % currentPhotos.length
        : (lbIdx - 1 + currentPhotos.length) % currentPhotos.length;
      document.getElementById("lb-img").src = currentPhotos[lbIdx];
    }
    touchX = null;
  }, { passive: true });
})();