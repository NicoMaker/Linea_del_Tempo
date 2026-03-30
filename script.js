(async () => {
  let DATA;
  try {
    const res = await fetch("data.json");
    DATA = await res.json();
  } catch (e) {
    console.error("Errore caricamento dati JSON");
    return;
  }

  const { anniversary: ann, events } = DATA;
  const tlMain = document.getElementById("timeline-main");

  // Popola i dati dell'anniversario
  document.getElementById("hero-names").textContent = ann.couple;
  document.getElementById("hero-range").textContent =
    `${ann.startDate} — ${ann.anniversaryDate}`;

  // Renderizza la timeline alternata con FOTO e DATA
  events.forEach((ev, index) => {
    const side = index % 2 === 0 ? "left" : "right";
    const item = document.createElement("div");
    item.className = `tl-item ${side}`;

    // Struttura blocco: Foto sopra, testo sotto
    item.innerHTML = `
      <div class="tl-content">
        <img src="${ev.cover}" alt="${ev.title}" class="tl-item-img">
        <div class="tl-text-wrap">
          <div class="tl-item-date">${ev.fullDate}</div>
          <div class="tl-year">${ev.year}</div>
          <h3 class="tl-title">${ev.emoji} ${ev.title}</h3>
          <p>${ev.description.substring(0, 70)}...</p>
        </div>
      </div>
    `;
    item.onclick = () => openModal(ev);
    tlMain.appendChild(item);
  });

  // Gestione Modale e Lightbox
  const modalOv = document.getElementById("p-ov");
  const lb = document.getElementById("lb");
  let currentPhotos = [];
  let lbIdx = 0;

  function openModal(ev) {
    document.getElementById("p-cover").src = ev.cover;
    document.getElementById("p-cover-title").textContent = ev.title;
    document.getElementById("p-full-date").textContent = ev.fullDate;
    document.getElementById("p-desc").textContent = ev.description;

    const gEl = document.getElementById("p-gallery");
    gEl.innerHTML = "";
    currentPhotos = ev.photos || [];
    currentPhotos.forEach((url, i) => {
      const img = document.createElement("img");
      img.src = url;
      img.onclick = (e) => {
        e.stopPropagation();
        openLightbox(i);
      };
      gEl.appendChild(img);
    });

    modalOv.classList.add("open"); // Usa la classe per CSS display: flex
    document.body.style.overflow = "hidden"; // Blocca lo scroll sotto
  }

  function openLightbox(i) {
    lbIdx = i;
    document.getElementById("lb-img").src = currentPhotos[lbIdx];
    lb.style.display = "flex";
  }

  function closeModal() {
    modalOv.classList.remove("open");
    document.body.style.overflow = "auto";
  }

  document.getElementById("p-close").onclick = closeModal;
  // Chiude se clicchi fuori dalla finestra modale
  modalOv.onclick = (e) => {
    if (e.target === modalOv) closeModal();
  };

  document.getElementById("lb-close").onclick = () =>
    (lb.style.display = "none");
  document.getElementById("lb-next").onclick = (e) => {
    e.stopPropagation();
    lbIdx = (lbIdx + 1) % currentPhotos.length;
    document.getElementById("lb-img").src = currentPhotos[lbIdx];
  };
  document.getElementById("lb-prev").onclick = (e) => {
    e.stopPropagation();
    lbIdx = (lbIdx - 1 + currentPhotos.length) % currentPhotos.length;
    document.getElementById("lb-img").src = currentPhotos[lbIdx];
  };
})();
