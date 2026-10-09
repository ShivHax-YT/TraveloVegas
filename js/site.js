// TraveloVegas: header states, mobile menu + bottom bar, hero parallax, rail controls, "Plan my night",
// category filters, the 21+ gate, Lenis.
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
  const top = hero ?? document.querySelector(".cat-hero"); // the bottom bar appears once this scrolls away
  const darks = [...document.querySelectorAll(".is-dark")];

  const lenis = !calm && window.Lenis ? new Lenis({ autoRaf: true }) : null;
  if (calm) hero?.querySelector("video")?.pause(); // poster only when motion is reduced

  // ----- In-page links glide with Lenis; without it the browser jumps natively -----
  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="#"]:not(.skip)');
    const target = link && document.getElementById(link.hash.slice(1));
    if (!lenis || !target || e.defaultPrevented) return;
    e.preventDefault();
    history.pushState(null, "", link.hash);
    lenis.scrollTo(target, { onComplete: () => target.querySelector('[tabindex="-1"]')?.focus({ preventScroll: true }) });
  });

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
    const heroBottom = top ? top.getBoundingClientRect().bottom : 0;

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
      const step = rail.querySelector(":scope > :not([hidden])").offsetWidth + parseFloat(getComputedStyle(rail).columnGap);
      rail.scrollBy({ left: step * Number(btn.dataset.dir), behavior: calm ? "auto" : "smooth" });
    }));
    rail.addEventListener("scroll", sync, { passive: true });
    rail.addEventListener("railchange", sync);
    addEventListener("resize", sync, { passive: true });
    nav.hidden = false;
    sync();
  });

  // ----- "Plan my night" (PATTERNS #8): idle -> selecting -> results -> (edit) -----
  const plan = document.querySelector(".plan");
  if (plan) {
    const KEY = "tv-plan";
    const LIMIT = 6;
    const rail = plan.querySelector(".plan-rail");
    const cards = [...rail.children];
    const showBtn = plan.querySelector("[data-show]");
    const hint = plan.querySelector(".picker-hint");
    const status = plan.querySelector(".plan-status");
    const groups = [...plan.querySelectorAll(".chips")];
    const chips = (g) => [...g.querySelectorAll(".chip")];
    const picked = (name) => {
      const g = groups.find((el) => el.dataset.group === name);
      return chips(g).filter((c) => c.getAttribute("aria-pressed") === "true");
    };
    const picks = () => ({
      vibe: picked("vibe").map((c) => c.value),
      budget: picked("budget")[0]?.value ?? "",
      who: picked("who")[0]?.value ?? "",
    });
    const save = () => {
      try { localStorage.setItem(KEY, JSON.stringify({ ...picks(), state: plan.dataset.state })); } catch {}
    };
    const setState = (state) => { plan.dataset.state = state; save(); };
    const refresh = () => {
      const { vibe, budget, who } = picks();
      showBtn.disabled = vibe.length === 0;
      hint.hidden = vibe.length > 0;
      setState(vibe.length || budget || who ? "selecting" : "idle");
    };
    // Who comes from tags: Kids = "family" (adult listings never reach the pool), Couple = "date-night", Friends = "group".
    const WHO = { kids: "family", couple: "date-night", friends: "group" };

    const render = () => {
      const { vibe, budget, who } = picks();
      const words = (c, key) => c.dataset[key].split(" ");
      const chosen = cards.filter((c) =>
        words(c, "vibe").some((v) => vibe.includes(v)) &&
        (!WHO[who] || words(c, "tags").includes(WHO[who])) &&
        (!budget || words(c, "budget").includes(budget))).slice(0, LIMIT);
      cards.forEach((c) => { c.hidden = true; });
      chosen.forEach((c) => { c.hidden = false; rail.append(c); });

      const label = (g) => picked(g).map((c) => c.textContent).join(", ");
      plan.querySelector(".plan-picked").textContent = [label("vibe"), label("budget"), label("who")].filter(Boolean).join(" · ");
      status.textContent = chosen.length
        ? `${chosen.length} ${chosen.length === 1 ? "pick" : "picks"} for your night.`
        : "Nothing matches all of that yet. Try another vibe or budget.";
      // Show the rail before the arrows measure it, or Next stays disabled.
      setState("results");
      rail.scrollLeft = 0;
      rail.dispatchEvent(new Event("railchange"));
    };

    groups.forEach((g) => g.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      const on = chip.getAttribute("aria-pressed") !== "true";
      if (!("multi" in g.dataset)) chips(g).forEach((c) => c.setAttribute("aria-pressed", "false"));
      chip.setAttribute("aria-pressed", String(on));
      // A group with an "Any" chip never ends up empty.
      const any = chips(g).find((c) => c.value === "");
      if (any && !picked(g.dataset.group).length) any.setAttribute("aria-pressed", "true");
      refresh();
    }));
    showBtn.addEventListener("click", () => { render(); plan.querySelector("[data-edit]").focus(); });
    plan.querySelector("[data-edit]").addEventListener("click", () => {
      setState("selecting");
      (picked("vibe")[0] ?? chips(groups[0])[0]).focus();
    });

    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(KEY)); } catch {}
    if (saved) {
      groups.forEach((g) => {
        const want = [].concat(saved[g.dataset.group] ?? []);
        chips(g).forEach((c) => c.setAttribute("aria-pressed", String(want.includes(c.value))));
        const any = chips(g).find((c) => c.value === "");
        if (any && !picked(g.dataset.group).length) any.setAttribute("aria-pressed", "true");
      });
      refresh();
      if (saved.state === "results" && picks().vibe.length) render();
    }
  }

  // ----- Category filter chips (one choice; "All" clears) -----
  document.querySelectorAll(".filter-chips").forEach((group) => {
    const list = group.closest(".cat-list");
    const cards = [...list.querySelectorAll(".cat-grid > .card")];
    const count = list.querySelector(".cat-count");
    group.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      group.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
      let shown = 0;
      cards.forEach((c) => {
        c.hidden = Boolean(chip.value) && !c.dataset.filter.split(" ").includes(chip.value);
        if (!c.hidden) shown++;
      });
      count.textContent = `${shown} ${shown === 1 ? "place" : "places"}${chip.value ? ` · ${chip.textContent}` : ""}`;
    });
  });

  // ----- 21+ gate: shown until the visitor confirms; the answer is remembered when storage allows -----
  const gate = document.querySelector("[data-gate]");
  if (gate) {
    const KEY = "tv-21";
    let ok = false;
    try { ok = localStorage.getItem(KEY) === "yes"; } catch {}
    const blocked = [document.querySelector(".site-header"), document.querySelector("main"), document.querySelector(".site-footer"), bar].filter(Boolean);
    const lock = (on) => {
      gate.hidden = !on;
      root.classList.toggle("is-locked", on);
      blocked.forEach((el) => { el.inert = on; });
      if (on) { lenis?.stop(); gate.querySelector("[data-gate-yes]").focus(); } else lenis?.start();
    };
    gate.querySelector("[data-gate-yes]").addEventListener("click", () => {
      try { localStorage.setItem(KEY, "yes"); } catch {}
      lock(false);
    });
    lock(!ok);
  }
})();
