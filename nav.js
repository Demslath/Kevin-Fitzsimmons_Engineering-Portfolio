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

/* copy-to-clipboard buttons (the contact email) */
document.querySelectorAll("[data-copy]").forEach((b) => {
  const label = b.textContent;
  b.addEventListener("click", () => {
    const done = () => { b.textContent = "Copied"; b.classList.add("is-done"); setTimeout(() => { b.textContent = label; b.classList.remove("is-done"); }, 1800); };
    if (navigator.clipboard) navigator.clipboard.writeText(b.dataset.copy).then(done, () => {});
    else { const t = document.createElement("textarea"); t.value = b.dataset.copy; document.body.append(t); t.select(); document.execCommand("copy"); t.remove(); done(); }
  });
});

/* Where am I: the banner names the section in view ("Experience › Course design projects")
   (the matching dropdown link also gets aria-current for screen readers). */
(function () {
  const top = document.querySelector('.nav .nav-top[aria-current="page"]');
  const crumb = document.querySelector(".nav-crumb");
  if (!top || !crumb) return;
  const links = Array.from(top.parentElement.querySelectorAll(".nav-menu a")).filter((a) => a.hash);
  const marks = links
    .map((a) => ({ a, el: document.getElementById(a.hash.slice(1)) }))
    .filter((m) => m.el && (a => a.pathname === location.pathname || a.pathname.endsWith(location.pathname.split("/").pop() || "index.html"))(m.a));
  if (!marks.length) return;
  const page = top.textContent.trim();
  let current = null;

  function update() {
    const line = (document.querySelector(".nav") || {}).offsetHeight || 72;
    const probe = line + Math.min(160, window.innerHeight * 0.25);
    let hit = marks[0];
    for (const m of marks) if (m.el.getBoundingClientRect().top <= probe) hit = m;
    // at the very bottom of the page the last section is the one being read
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) hit = marks[marks.length - 1];
    if (hit === current) return;
    if (current) current.a.removeAttribute("aria-current");
    current = hit;
    hit.a.setAttribute("aria-current", "location");
    crumb.innerHTML = "";
    const p = document.createElement("span"); p.className = "nav-crumb-page"; p.textContent = page;
    const sep = document.createElement("span"); sep.className = "nav-crumb-sep"; sep.setAttribute("aria-hidden", "true"); sep.textContent = "›";
    const sec = document.createElement("span"); sec.className = "nav-crumb-sec"; sec.textContent = hit.a.textContent;
    crumb.append(p, sep, sec);
    crumb.hidden = false;
    crumb.classList.remove("is-swap"); void crumb.offsetWidth; crumb.classList.add("is-swap");
  }
  let queued = false;
  const onScroll = () => { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; update(); }); };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
})();
