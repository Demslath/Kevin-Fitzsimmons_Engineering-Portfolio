/* ============================================================
   Generative cover — string-art ellipses around a black "eye",
   after the cover of "Digestate to Clean Water" (Capstone 2).
   Usage: <canvas data-cover data-eye-x="0.4" data-eye-y="0.45"
                  data-scale="1" data-density="1"></canvas>
   ============================================================ */
(function () {
  const canvases = document.querySelectorAll("canvas[data-cover]");
  if (!canvases.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const LINE = "232, 234, 228";

  // Each ribbon is a family of ellipses whose radii, rotation and centre
  // drift slightly from one member to the next, so the strokes twist into
  // a woven band. Values are fractions of the base size S.
  const RIBBONS = [
    { n: 120, rx: [1.05, 0.62], ry: [0.42, 0.30], rot: [-0.62, 0.55], off: [[-0.06, 0.02], [0.05, -0.03]], speed: 0.020, alpha: 0.30 },
    { n: 110, rx: [0.88, 0.70], ry: [0.30, 0.52], rot: [0.30, 1.35], off: [[0.04, 0.05], [-0.03, -0.02]], speed: -0.016, alpha: 0.26 },
    { n: 100, rx: [1.30, 1.00], ry: [0.62, 0.40], rot: [-0.20, 0.45], off: [[-0.12, 0.10], [0.02, 0.02]], speed: 0.011, alpha: 0.20 },
    { n: 90,  rx: [0.56, 0.42], ry: [0.30, 0.22], rot: [0.9, 2.3],  off: [[0.0, 0.0], [0.02, 0.0]], speed: -0.026, alpha: 0.32 },
    { n: 70,  rx: [1.55, 1.30], ry: [0.85, 0.70], rot: [0.55, 0.85], off: [[0.10, -0.06], [-0.04, 0.05]], speed: 0.007, alpha: 0.14 },
  ];
  // A few single, brighter sweeping arcs, like the long curves on the cover.
  const ARCS = [
    { rx: 1.42, ry: 0.80, rot: -0.75, off: [0.02, 0.03], speed: 0.012, alpha: 0.75, w: 1.1 },
    { rx: 1.10, ry: 0.46, rot: 0.42, off: [-0.02, 0.0], speed: -0.009, alpha: 0.6, w: 0.9 },
    { rx: 1.75, ry: 1.05, rot: 0.15, off: [0.05, -0.02], speed: 0.005, alpha: 0.45, w: 0.8 },
  ];

  const lerp = (a, b, t) => a + (b - a) * t;

  function setup(canvas) {
    const ctx = canvas.getContext("2d");
    const eyeX = parseFloat(canvas.dataset.eyeX || "0.5");
    const eyeY = parseFloat(canvas.dataset.eyeY || "0.5");
    const scale = parseFloat(canvas.dataset.scale || "1");
    const density = parseFloat(canvas.dataset.density || "1");
    const showEye = canvas.dataset.eye !== "false";

    let w = 0, h = 0, dpr = 1, visible = true, raf = 0, last = 0;
    let px = 0, py = 0, tx = 0, ty = 0; // pointer parallax
    const start = performance.now() - 40000 * Math.random();

    function resize() {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      draw(performance.now());
    }

    function draw(now) {
      const t = (now - start) / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const S = Math.min(Math.max(w, h * 0.9), Math.max(w, h)) * 0.5 * scale;
      px = lerp(px, tx, 0.04); py = lerp(py, ty, 0.04);
      const cx = w * eyeX + px * 14, cy = h * eyeY + py * 14;
      const small = w < 700;
      const thin = small ? 0.5 : 0.55;

      RIBBONS.forEach((rb, k) => {
        const n = Math.round(rb.n * density * (small ? 0.65 : 1));
        const spin = t * rb.speed;
        const breathe = Math.sin(t * 0.07 + k * 1.7) * 0.04;
        ctx.lineWidth = thin;
        ctx.strokeStyle = `rgba(${LINE}, ${rb.alpha})`;
        ctx.beginPath();
        for (let i = 0; i < n; i++) {
          const u = i / (n - 1);
          const rx = S * lerp(rb.rx[0], rb.rx[1], u);
          const ry = S * (lerp(rb.ry[0], rb.ry[1], u) + breathe);
          const rot = lerp(rb.rot[0], rb.rot[1], u) + spin;
          const ox = S * lerp(rb.off[0][0], rb.off[1][0], u) - px * 6 * (k + 1);
          const oy = S * lerp(rb.off[0][1], rb.off[1][1], u) - py * 6 * (k + 1);
          ctx.moveTo(cx + ox + rx * Math.cos(rot), cy + oy + rx * Math.sin(rot));
          ctx.ellipse(cx + ox, cy + oy, rx, Math.max(ry, 1), rot, 0, Math.PI * 2);
        }
        ctx.stroke();
      });

      ARCS.forEach((a) => {
        const rot = a.rot + t * a.speed;
        ctx.lineWidth = a.w;
        ctx.strokeStyle = `rgba(${LINE}, ${a.alpha})`;
        ctx.beginPath();
        ctx.ellipse(cx + a.off[0] * S, cy + a.off[1] * S, a.rx * S, a.ry * S, rot, 0, Math.PI * 2);
        ctx.stroke();
      });

      if (showEye) {
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(cx, cy, S * 0.19, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function loop(now) {
      raf = requestAnimationFrame(loop);
      if (now - last < 33) return; // ~30 fps is plenty for slow drift
      last = now;
      draw(now);
    }

    function play() {
      if (reduceMotion || raf || !visible || document.hidden) return;
      raf = requestAnimationFrame(loop);
    }
    function pause() { cancelAnimationFrame(raf); raf = 0; }

    new ResizeObserver(resize).observe(canvas);
    new IntersectionObserver((es) => {
      visible = es[0].isIntersecting;
      visible ? play() : pause();
    }).observe(canvas);
    document.addEventListener("visibilitychange", () => (document.hidden ? pause() : play()));

    if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
      window.addEventListener("pointermove", (e) => {
        tx = e.clientX / window.innerWidth - 0.5;
        ty = e.clientY / window.innerHeight - 0.5;
      }, { passive: true });
    }

    resize();
    play();
  }

  canvases.forEach(setup);
})();
