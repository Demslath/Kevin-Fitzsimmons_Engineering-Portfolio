/* Section dropdowns in the main menu, plus: every PDF opens in a new tab. */
(function () {
  const items = Array.from(document.querySelectorAll(".nav-item"));

  function closeAll(except) {
    items.forEach((it) => {
      if (it === except) return;
      it.classList.remove("is-open");
      const b = it.querySelector(".nav-toggle");
      if (b) b.setAttribute("aria-expanded", "false");
    });
  }

  items.forEach((it) => {
    const btn = it.querySelector(".nav-toggle");
    if (!btn) return;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = !it.classList.contains("is-open");
      closeAll(it);
      it.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
      if (open) {
        const first = it.querySelector(".nav-menu a");
        if (first && e.detail === 0) first.focus(); // keyboard activation
      }
    });
    // close the menu after choosing a section on the same page
    it.querySelectorAll(".nav-menu a").forEach((a) => a.addEventListener("click", () => closeAll()));
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".nav-item")) closeAll();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const open = document.querySelector(".nav-item.is-open");
    if (open) {
      closeAll();
      const b = open.querySelector(".nav-toggle");
      if (b) b.focus();
    }
  });

  // Phone menu: one button opens every page and its sections
  const burger = document.querySelector(".nav-burger");
  if (burger) {
    const host = burger.closest(".nav, .cover-nav");
    burger.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = !host.classList.contains("menu-open");
      host.classList.toggle("menu-open", open);
      burger.setAttribute("aria-expanded", String(open));
    });
    host.querySelectorAll(".nav-links a").forEach((a) =>
      a.addEventListener("click", () => {
        host.classList.remove("menu-open");
        burger.setAttribute("aria-expanded", "false");
      }));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && host.classList.contains("menu-open")) {
        host.classList.remove("menu-open");
        burger.setAttribute("aria-expanded", "false");
        burger.focus();
      }
    });
  }

  // PDFs always open in a new tab
  document.querySelectorAll('a[href$=".pdf"]').forEach((a) => {
    a.target = "_blank";
    a.rel = "noopener";
  });
})();
