// Lightbox gallery — click a thumbnail to open, arrows/keyboard to browse.
// Works on any page that has a .gallery-grid of <button class="gallery-thumb"><img></button> elements.
(function () {
  const thumbs = Array.from(document.querySelectorAll(".gallery-thumb"));
  if (!thumbs.length) return;

  const images = thumbs.map((el) => ({
    src: el.dataset.full || el.querySelector("img").src,
    alt: el.querySelector("img").alt || "",
  }));

  const overlay = document.createElement("div");
  overlay.className = "lightbox-overlay";
  overlay.innerHTML = `
    <button class="lightbox-close" aria-label="Close">&times;</button>
    <button class="lightbox-arrow prev" aria-label="Previous photo">&#8249;</button>
    <div class="lightbox-figure">
      <img alt="">
      <span class="lightbox-counter"></span>
    </div>
    <button class="lightbox-arrow next" aria-label="Next photo">&#8250;</button>
  `;
  document.body.appendChild(overlay);

  const imgEl = overlay.querySelector("img");
  const counterEl = overlay.querySelector(".lightbox-counter");
  const closeBtn = overlay.querySelector(".lightbox-close");
  const prevBtn = overlay.querySelector(".prev");
  const nextBtn = overlay.querySelector(".next");

  let current = 0;

  function render() {
    const item = images[current];
    imgEl.src = item.src;
    imgEl.alt = item.alt;
    counterEl.textContent = `${current + 1} / ${images.length}`;
  }

  function open(index) {
    current = index;
    render();
    overlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function close() {
    overlay.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  function next() {
    current = (current + 1) % images.length;
    render();
  }

  function prev() {
    current = (current - 1 + images.length) % images.length;
    render();
  }

  thumbs.forEach((el, i) => {
    el.addEventListener("click", () => open(i));
  });

  closeBtn.addEventListener("click", close);
  nextBtn.addEventListener("click", next);
  prevBtn.addEventListener("click", prev);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  document.addEventListener("keydown", (e) => {
    if (!overlay.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  });
})();