// TraveloVegas: header states, mobile menu + bottom bar, hero parallax, rail controls, Lenis.
// The hero reveal is CSS (site.css) so copy is visible even if this file never runs.
(() => {
  const root = document.documentElement;
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const desktop = matchMedia("(min-width: 900px)");
  const header = document.querySelector("[data-header]");
  const hero = document.querySelector(".hero");
  const media = hero?.querySelector(".hero-media");
  const copy = hero?.querySelector(".hero-copy");
  const bar = document.querySelector(".bottom-bar");
  const darks = [...document.querySelectorAll(".is-dark")];

  const lenis = !calm && window.Lenis ? new Lenis({ autoRaf: true }) : null;

  // ----- Scroll-driven state: one passive listener, one rAF per frame -----
  let ticking = false;
  const update = () => {
    ticking = false;
    const y = scrollY;
    const vh = innerHeight;
    const mid = header.offsetHeight / 2;
    const overDark = darks.some((el) => {
      const r = el.getBoundingClientRect();
      return r.top <= mid && r.bottom >= mid;
    });
    const heroBottom = hero ? hero.getBoundingClientRect().bottom : 0;

    header.classList.toggle("solid", y > vh * 0.6);
    header.classList.toggle("over-dark", overDark);
    bar?.classList.toggle("show", heroBottom < vh * 0.35);

    if (!calm && media && y <= vh * 1.2) {
      const p = y / vh;
      media.style.translate = `0 ${y * 0.3}px`;
      copy.style.translate = `0 ${y * 0.14}px`;
      copy.style.opacity = 1 - p * 0.55;
    }
  };
  const onScroll = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll, { passive: true });
  update();

  // ----- Mobile menu sheet -----
  const menuBtn = header.querySelector(".menu-btn");
  const panel = document.getElementById("site-menu");
  const behind = [document.querySelector("main"), document.querySelector(".site-footer"), bar].filter(Boolean);
  const setMenu = (open) => {
    menuBtn.setAttribute("aria-expanded", String(open));
    header.classList.toggle("menu-open", open);
    root.classList.toggle("is-locked", open);
    behind.forEach((el) => { el.inert = open; });
    if (open) { lenis?.stop(); panel.querySelector("a")?.focus(); }
    else lenis?.start();
  };
  menuBtn.addEventListener("click", () => setMenu(menuBtn.getAttribute("aria-expanded") !== "true"));
  panel.addEventListener("click", (e) => { if (e.target.closest("a") && !desktop.matches) setMenu(false); });
  addEventListener("keydown", (e) => {
    if (e.key === "Escape" && header.classList.contains("menu-open")) { setMenu(false); menuBtn.focus(); }
  });
  desktop.addEventListener("change", () => setMenu(false));

  // ----- Rail prev/next (desktop) -----
  document.querySelectorAll(".rail-nav").forEach((nav) => {
    const rail = document.getElementById(nav.querySelector("[aria-controls]").getAttribute("aria-controls"));
    const [prev, next] = nav.querySelectorAll(".rail-btn");
    const sync = () => {
      prev.setAttribute("aria-disabled", String(rail.scrollLeft <= 2));
      next.setAttribute("aria-disabled", String(rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 2));
    };
    nav.querySelectorAll(".rail-btn").forEach((btn) => btn.addEventListener("click", () => {
      if (btn.getAttribute("aria-disabled") === "true") return;
      const step = rail.firstElementChild.offsetWidth + parseFloat(getComputedStyle(rail).columnGap);
      rail.scrollBy({ left: step * Number(btn.dataset.dir), behavior: calm ? "auto" : "smooth" });
    }));
    rail.addEventListener("scroll", sync, { passive: true });
    addEventListener("resize", sync, { passive: true });
    nav.hidden = false;
    sync();
  });
})();
