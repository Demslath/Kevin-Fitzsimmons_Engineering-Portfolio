/* Lightbox: any <button data-full="..." data-caption="..."> inside a
   [data-lightbox] group opens full size; arrows and keys browse the group. */
(function () {
  const groups = document.querySelectorAll("[data-lightbox]");
  if (!groups.length) return;

  const box = document.createElement("div");
  box.className = "lightbox";
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-modal", "true");
  box.setAttribute("aria-label", "Photo viewer");
  box.innerHTML =
    '<button class="lb-close" aria-label="Close photo viewer">close</button>' +
    '<button class="lb-prev" aria-label="Previous photo">&#8249;</button>' +
    '<figure><img alt=""><figcaption></figcaption></figure>' +
    '<button class="lb-next" aria-label="Next photo">&#8250;</button>';
  document.body.appendChild(box);

  const img = box.querySelector("img");
  const cap = box.querySelector("figcaption");
  let items = [], i = 0, opener = null;

  function show() {
    const el = items[i];
    const thumb = el.querySelector("img");
    img.src = el.dataset.full || thumb.src;
    img.alt = thumb.alt || "";
    cap.textContent = (el.dataset.caption || thumb.alt || "") + "   " + (i + 1) + " of " + items.length;
  }
  function open(group, index, btn) {
    items = Array.from(group.querySelectorAll("button[data-full]"));
    i = index; opener = btn;
    show();
    box.classList.add("is-open");
    document.body.style.overflow = "hidden";
    box.querySelector(".lb-close").focus();
  }
  function close() {
    box.classList.remove("is-open");
    document.body.style.overflow = "";
    if (opener) opener.focus();
  }
  const step = (d) => { i = (i + d + items.length) % items.length; show(); };

  groups.forEach((g) => {
    g.querySelectorAll("button[data-full]").forEach((b, idx) =>
      b.addEventListener("click", () => open(g, idx, b)));
  });
  box.querySelector(".lb-close").addEventListener("click", close);
  box.querySelector(".lb-prev").addEventListener("click", () => step(-1));
  box.querySelector(".lb-next").addEventListener("click", () => step(1));
  box.addEventListener("click", (e) => { if (e.target === box) close(); });
  document.addEventListener("keydown", (e) => {
    if (!box.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight") step(1);
    if (e.key === "ArrowLeft") step(-1);
  });
})();
