(async () => {
  let DATA;
  try {
    const res = await fetch("data.json");
    DATA = await res.json();
  } catch (e) {
    console.error("Errore caricamento data.json");
    return;
  }

  const { anniversary: ann, events } = DATA;

  function formatDateLabel(ev) {
    return ev.dateTo ? `${ev.dateFrom} – ${ev.dateTo}` : ev.dateFrom;
  }

  document.getElementById("nav-couple").textContent = ann.couple;

  const tlEvents = document.getElementById("tl-events");

  events.forEach((ev, i) => {
    const side = i % 2 === 0 ? "left" : "right";
    const el = document.createElement("div");
    el.className = `tl-event ${side}`;

    const dateLabel = formatDateLabel(ev);
    const excerpt =
      ev.description.length > 88
        ? ev.description.substring(0, 88) + "…"
        : ev.description;

    const cardHTML = `
      <div class="tl-card" role="button" tabindex="0" aria-label="Apri ${ev.title}">
        <div class="tl-card-img-wrap">
          <img class="tl-card-img" src="${ev.cover}" alt="${ev.title}" loading="lazy" />
          <div class="tl-card-img-overlay"></div>
          <div class="tl-card-cat-pill">
            <span class="tl-card-emoji">${ev.emoji}</span>
            <span>${ev.category}</span>
          </div>
        </div>
        <div class="tl-card-body">
          <p class="tl-card-date">${dateLabel}</p>
          <h3 class="tl-card-title">${ev.title}</h3>
          <p class="tl-card-excerpt">${excerpt}</p>
          <div class="tl-card-cta">
            <span>Scopri</span>
            <span class="tl-card-cta-arrow">→</span>
          </div>
        </div>
      </div>`;

    const nodeHTML = `
      <div class="tl-node">
        <span class="tl-node-year">${ev.year}</span>
        <div class="tl-dot-outer"><div class="tl-dot"></div></div>
      </div>`;

    if (side === "left") {
      el.innerHTML = cardHTML + nodeHTML + `<div class="tl-spacer"></div>`;
    } else {
      el.innerHTML = `<div class="tl-spacer"></div>` + nodeHTML + cardHTML;
    }

    const card = el.querySelector(".tl-card");
    const open = () => openModal(ev);
    card.addEventListener("click", open);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    });

    tlEvents.appendChild(el);
  });

  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("visible");
          io.unobserve(en.target);
        }
      }),
    { threshold: 0.08 },
  );
  document.querySelectorAll(".tl-event").forEach((el) => io.observe(el));
  document.querySelectorAll(".tl-event").forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.04}s`;
  });

  const backdrop = document.getElementById("modal-backdrop");
  let currentPhotos = [];
  let lbIdx = 0;

  function openModal(ev) {
    document.getElementById("modal-cover").src = ev.cover;
    document.getElementById("modal-cover").alt = ev.title;
    document.getElementById("modal-title").textContent = ev.title;
    document.getElementById("modal-desc").textContent = ev.description;
    document.getElementById("modal-cat").textContent = ev.category || "";

    const dateLabel = ev.dateTo
      ? `${ev.dateFrom} – ${ev.dateTo} · ${ev.year}`
      : `${ev.dateFrom} · ${ev.year}`;
    document.getElementById("modal-date").textContent = dateLabel;

    const gallery = document.getElementById("modal-gallery");
    gallery.innerHTML = "";
    currentPhotos = ev.photos || [];
    currentPhotos.forEach((url, i) => {
      const img = document.createElement("img");
      img.src = url;
      img.alt = `${ev.title} — foto ${i + 1}`;
      img.loading = "lazy";
      img.addEventListener("click", (e) => {
        e.stopPropagation();
        openLightbox(i);
      });
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
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal();
      closeLightbox();
    }
  });

  const lb = document.getElementById("lb");

  function updateCounter() {
    const el = document.getElementById("lb-counter");
    el.innerHTML = `<span class="lb-cur">${lbIdx + 1}</span><span class="lb-sep">/</span><span class="lb-tot">${currentPhotos.length}</span>`;
  }

  function openLightbox(i) {
    lbIdx = i;
    document.getElementById("lb-img").src = currentPhotos[lbIdx];
    lb.style.display = "flex";
    updateCounter();
  }
  function closeLightbox() {
    lb.style.display = "none";
  }

  document.getElementById("lb-close").addEventListener("click", closeLightbox);
  document.getElementById("lb-next").addEventListener("click", (e) => {
    e.stopPropagation();
    lbIdx = (lbIdx + 1) % currentPhotos.length;
    document.getElementById("lb-img").src = currentPhotos[lbIdx];
    updateCounter();
  });
  document.getElementById("lb-prev").addEventListener("click", (e) => {
    e.stopPropagation();
    lbIdx = (lbIdx - 1 + currentPhotos.length) % currentPhotos.length;
    document.getElementById("lb-img").src = currentPhotos[lbIdx];
    updateCounter();
  });
  lb.addEventListener("click", (e) => {
    if (e.target === lb || e.target.id === "lb-stage") closeLightbox();
  });

  let touchX = null;
  lb.addEventListener(
    "touchstart",
    (e) => {
      touchX = e.changedTouches[0].clientX;
    },
    { passive: true },
  );
  lb.addEventListener(
    "touchend",
    (e) => {
      if (touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 40) {
        lbIdx =
          dx < 0
            ? (lbIdx + 1) % currentPhotos.length
            : (lbIdx - 1 + currentPhotos.length) % currentPhotos.length;
        document.getElementById("lb-img").src = currentPhotos[lbIdx];
        updateCounter();
      }
      touchX = null;
    },
    { passive: true },
  );

  const nav = document.getElementById("nav");
  window.addEventListener(
    "scroll",
    () => {
      nav.style.boxShadow =
        window.scrollY > 30 ? "0 1px 40px rgba(0,0,0,.45)" : "none";
    },
    { passive: true },
  );
})();
