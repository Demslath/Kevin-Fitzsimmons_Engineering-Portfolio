/* Slideshows: <div class="slides" data-autoplay> with .slide children,
   built-in arrows, a thumbnail strip, swipe and keyboard. Autoplay holds each
   image 5 s, pauses on hover or focus, stops for good after any click, swipe or
   key press, and is off on touch screens and for reduced motion. Clicking a slide still
   opens the photo viewer from gallery.js. */
(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // no auto-rotation on phones and other touch-first screens
  const mobile = window.matchMedia("(hover: none), (max-width: 760px)");
  const HOLD = 5000;
  document.querySelectorAll(".slides").forEach((root) => {
    const slides = Array.from(root.querySelectorAll(".slide"));
    if (slides.length < 2) { root.classList.add("single"); return; }
    let i = 0, timer = 0, manual = false, hovered = false, focused = false;

    const stage = root.querySelector(".slides-stage");
    const prev = document.createElement("button");
    const next = document.createElement("button");
    prev.className = "slides-arrow prev"; next.className = "slides-arrow next";
    prev.setAttribute("aria-label", "Previous image"); next.setAttribute("aria-label", "Next image");
    prev.innerHTML = '<svg viewBox="0 0 12 20" aria-hidden="true"><path d="M10 2 2 10l8 8" fill="none" stroke="currentColor" stroke-width="2.2"/></svg>';
    next.innerHTML = '<svg viewBox="0 0 12 20" aria-hidden="true"><path d="m2 2 8 8-8 8" fill="none" stroke="currentColor" stroke-width="2.2"/></svg>';
    stage.append(prev, next);

    const counter = document.createElement("span");
    counter.className = "slides-count";
    stage.append(counter);

    const strip = document.createElement("div");
    strip.className = "slides-thumbs";
    slides.forEach((s, k) => {
      const img = s.querySelector("img");
      if (s.querySelector("video")) s.classList.add("has-video");
      const t = document.createElement("button");
      t.type = "button";
      t.setAttribute("aria-label", "Show image " + (k + 1) + ": " + (img.alt || ""));
      t.innerHTML = '<img src="' + img.getAttribute("src") + '" alt="" loading="lazy">';
      if (img.classList.contains("contain")) t.classList.add("contain");
      t.addEventListener("click", () => { go(k); halt(); });
      strip.append(t);
    });
    root.append(strip);
    const thumbs = Array.from(strip.children);

    function go(k) {
      i = (k + slides.length) % slides.length;
      slides.forEach((s, n) => {
        s.classList.toggle("is-active", n === i);
        s.setAttribute("aria-hidden", n === i ? "false" : "true");
        s.querySelectorAll("button").forEach((b) => (b.tabIndex = n === i ? 0 : -1));
      });
      thumbs.forEach((t, n) => t.classList.toggle("is-active", n === i));
      slides.forEach((s, n) => {
        const v = s.querySelector("video");
        if (!v) return;
        if (n === i && !reduce) { v.currentTime = 0; v.play().catch(() => {}); } else v.pause();
      });
      counter.textContent = (i + 1) + " / " + slides.length;
    }
    function play() {
      if (reduce || mobile.matches || manual || hovered || focused || !root.hasAttribute("data-autoplay") || timer) return;
      timer = setInterval(() => go(i + 1), HOLD);
    }
    function stop() { clearInterval(timer); timer = 0; }
    // a click, tap, swipe or key press hands control to the visitor for good
    function halt() { manual = true; stop(); }

    prev.addEventListener("click", () => { go(i - 1); halt(); });
    next.addEventListener("click", () => { go(i + 1); halt(); });
    stage.addEventListener("click", halt);
    root.addEventListener("mouseenter", () => { hovered = true; stop(); });
    root.addEventListener("mouseleave", () => { hovered = false; play(); });
    root.addEventListener("focusin", () => { focused = true; stop(); });
    root.addEventListener("focusout", (e) => { if (!root.contains(e.relatedTarget)) { focused = false; play(); } });
    root.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") { go(i - 1); halt(); }
      if (e.key === "ArrowRight") { go(i + 1); halt(); }
    });
    let x0 = null;
    stage.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; stop(); }, { passive: true });
    stage.addEventListener("touchend", (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) { go(dx < 0 ? i + 1 : i - 1); halt(); } else play();
      x0 = null;
    });
    new IntersectionObserver((es) => (es[0].isIntersecting ? play() : stop())).observe(root);
    go(0);
  });
})();
