// TraveloVegas: header states, mobile menu + bottom bar, hero parallax, rail controls, "Plan my night",
// category filters and "Show all", the Strip map, the 21+ gate, background video controls, Lenis.
// The hero reveal is CSS (site.css) so copy is visible even if this file never runs.
(() => {
  const root = document.documentElement;
  const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
  let calm = motionQuery.matches; // updated live below
  const desktop = matchMedia("(min-width: 900px)");
  const header = document.querySelector("[data-header]");
  const hero = document.querySelector(".hero");
  const media = hero?.querySelector(".hero-media");
  const copy = hero?.querySelector(".hero-copy");
  const bar = document.querySelector(".bottom-bar");
  const top = hero ?? document.querySelector(".cat-hero"); // the bottom bar appears once this scrolls away
  const darks = [...document.querySelectorAll(".is-dark")];
  const main = document.querySelector("main");
  const footer = document.querySelector(".site-footer");
  const skip = document.querySelector(".skip");

  let lenis = !calm && window.Lenis ? new Lenis({ autoRaf: true }) : null;

  // ----- Locks: the mobile menu and the 21+ gate each make parts of the page inert and stop scrolling.
  // Held per reason, so releasing one (say the menu closing at 900px) never releases the other. -----
  const locks = new Map();
  const lockable = [skip, header, main, footer, bar].filter(Boolean);
  const lock = (reason, els) => {
    if (els) locks.set(reason, els); else locks.delete(reason);
    const held = new Set([...locks.values()].flat());
    lockable.forEach((el) => { el.inert = held.has(el); });
    root.classList.toggle("is-locked", locks.size > 0);
    if (locks.size) lenis?.stop(); else lenis?.start();
  };

  // ----- Background videos (home + category heroes). Pause button per WCAG 2.2.2: aria-pressed="true" = paused.
  // The visitor's own choice wins; otherwise paused under reduced motion. Always paused while scrolled out of view. -----
  const videos = [...document.querySelectorAll("[data-video-toggle]")].map((btn) => {
    const video = btn.parentElement.querySelector("[data-video]");
    let choice = null; // "play" | "pause" once the visitor presses the button
    let inView = true;
    const sync = () => {
      const paused = choice ? choice === "pause" : calm;
      btn.setAttribute("aria-pressed", String(paused));
      if (paused || !inView) video.pause(); else video.play().catch(() => {});
    };
    btn.addEventListener("click", () => {
      choice = btn.getAttribute("aria-pressed") === "true" ? "play" : "pause";
      sync();
    });
    new IntersectionObserver(([e]) => { inView = e.isIntersecting; sync(); }).observe(btn.parentElement);
    sync();
    return () => { choice = null; sync(); };
  });

  // Reduced motion switched on mid-visit: stop video, smooth scroll and parallax right away.
  motionQuery.addEventListener("change", (e) => {
    calm = e.matches;
    if (!calm) return;
    videos.forEach((reset) => reset());
    lenis?.destroy();
    lenis = null;
    if (media) { media.style.translate = ""; copy.style.translate = ""; copy.style.opacity = ""; }
  });

  // ----- In-page links: glide with Lenis (else the browser jumps), then focus the target's heading -----
  const focusIn = (target) =>
    (target.matches('[tabindex="-1"]') ? target : target.querySelector('[tabindex="-1"]'))?.focus({ preventScroll: true });
  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="#"]:not(.skip)');
    const target = link && document.getElementById(link.hash.slice(1));
    if (!target || e.defaultPrevented) return;
    if (!lenis) { setTimeout(() => focusIn(target)); return; } // native jump, then focus
    e.preventDefault();
    history.pushState(null, "", link.hash);
    lenis.scrollTo(target, { onComplete: () => focusIn(target) });
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

  // Header turns solid once the hero (home or category) has scrolled out from under it.
  if (top) {
    new IntersectionObserver(([e]) => header.classList.toggle("solid", !e.isIntersecting), {
      rootMargin: `-${header.offsetHeight}px 0px 0px 0px`,
    }).observe(top);
  } else header.classList.add("solid");

  // ----- Mobile menu sheet -----
  const menuBtn = header.querySelector(".menu-btn");
  const panel = document.getElementById("site-menu");
  const setMenu = (open) => {
    menuBtn.setAttribute("aria-expanded", String(open));
    header.classList.toggle("menu-open", open);
    lock("menu", open ? [main, footer, bar].filter(Boolean) : null);
    if (open) panel.querySelector("a")?.focus();
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

  // ----- "Show all" for long /eat/ groups: collapsed here, so without JS every card stays visible -----
  document.querySelectorAll(".show-all").forEach((btn) => {
    const more = document.getElementById(btn.getAttribute("aria-controls")).querySelectorAll("[data-more]");
    const label = btn.textContent;
    const set = (open) => {
      more.forEach((c) => { c.hidden = !open; });
      btn.setAttribute("aria-expanded", String(open));
      btn.textContent = open ? "Show fewer" : label;
    };
    btn.addEventListener("click", () => set(btn.getAttribute("aria-expanded") !== "true"));
    btn.hidden = false;
    set(false);
  });

  // ----- Strip map (PATTERNS #9): a pin shows its card; without JS all pin cards stay listed -----
  const map = document.querySelector(".map");
  if (map) {
    const pins = [...map.querySelectorAll(".pin")];
    const cards = [...map.querySelectorAll(".map-cards > .card")];
    const hint = map.querySelector(".map-hint");
    // Focus only swaps the card; a tap, click, Enter or Space also brings it into view (it sits above the map on phones).
    const show = (id, reveal = false) => {
      cards.forEach((c) => { c.hidden = c.dataset.pin !== id; });
      pins.forEach((p) => {
        p.classList.toggle("is-active", p.dataset.pin === id);
        p.setAttribute("aria-pressed", String(p.dataset.pin === id));
      });
      hint.hidden = Boolean(id);
      const card = reveal && cards.find((c) => !c.hidden);
      if (!card) return;
      const r = card.getBoundingClientRect();
      if (r.top >= header.offsetHeight && r.bottom <= innerHeight) return;
      if (lenis) lenis.scrollTo(card);
      else card.scrollIntoView({ block: "start", behavior: calm ? "auto" : "smooth" });
    };
    pins.forEach((p) => {
      p.addEventListener("click", () => show(p.dataset.pin, true));
      p.addEventListener("focus", () => show(p.dataset.pin));
      p.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); show(p.dataset.pin, true); }
      });
    });
    show(null);
  }

  // ----- 21+ gate. The HTML ships with the gate showing and the listings hidden, so no-JS visitors
  // only see the gate and the cannabis rules. Here it becomes a modal with a focus trap until confirmed. -----
  const gate = document.querySelector("[data-gate]");
  if (gate) {
    const KEY = "tv-21";
    const list = document.querySelector("[data-gated]");
    const reveal = () => {
      gate.remove();
      if (list) list.hidden = false;
    };
    let ok = false;
    try { ok = localStorage.getItem(KEY) === "yes"; } catch {}
    if (ok) reveal();
    else {
      gate.classList.add("is-modal");
      gate.setAttribute("role", "dialog");
      gate.setAttribute("aria-modal", "true");
      lock("gate", lockable);
      const focusables = () => [...gate.querySelectorAll("a[href], button:not([disabled])")];
      gate.addEventListener("keydown", (e) => {
        if (e.key !== "Tab") return;
        const f = focusables();
        const [first, last] = [f[0], f.at(-1)];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      });
      gate.querySelector("[data-gate-yes]").addEventListener("click", () => {
        try { localStorage.setItem(KEY, "yes"); } catch {}
        reveal();
        lock("gate", null);
        document.getElementById("cat-title")?.focus();
      });
      focusables()[0].focus();
    }
  }
})();
