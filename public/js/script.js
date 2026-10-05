"use strict";

const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const loader = qs("#loader");
const header = qs("#header");
const menuBtn = qs("#menuBtn");
const nav = qs("#nav");
const navLinks = qsa(".nav-link");
const progressBar = qs("#scrollProgress");
const heroImage = qs(".hero-bg img");
const revealElements = qsa(".reveal");
const counters = qsa(".counter");
const sections = qsa("section[id]");
const galleryTrack = qs(".gallery-track");

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)");

let lastScrollY = window.scrollY;
let ticking = false;

/* =========================================================
   Page ready / loader
========================================================= */

window.addEventListener("load", () => {
  document.body.classList.add("ready");

  window.setTimeout(() => {
    loader?.classList.add("hide");
  }, 420);
});

/* =========================================================
   Current year
========================================================= */

const year = qs("#year");
if (year) year.textContent = new Date().getFullYear();

/* =========================================================
   Mobile menu
========================================================= */

function setMenu(open) {
  if (!nav || !menuBtn) return;

  nav.classList.toggle("open", open);
  menuBtn.classList.toggle("active", open);
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  document.body.classList.toggle("menu-open", open);
}

menuBtn?.addEventListener("click", () => {
  setMenu(!nav.classList.contains("open"));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});

/* =========================================================
   Reveal animation
========================================================= */

if (!reducedMotion.matches && "IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -42px 0px"
    }
  );

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("visible"));
}

/* =========================================================
   Counter animation
========================================================= */

function formatCounter(value, target) {
  if (target >= 1000) {
    return `${(value / 1000).toFixed(1)}K+`;
  }
  return `${Math.floor(value)}+`;
}

function animateCounter(counter) {
  const target = Number(counter.dataset.target);
  if (!Number.isFinite(target) || target <= 0) return;

  if (reducedMotion.matches) {
    counter.textContent = formatCounter(target, target);
    return;
  }

  const duration = 1250;
  const start = performance.now();

  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = target * eased;

    counter.textContent = formatCounter(value, target);

    if (progress < 1) {
      requestAnimationFrame(frame);
    } else {
      counter.textContent = formatCounter(target, target);
    }
  }

  requestAnimationFrame(frame);
}

if ("IntersectionObserver" in window) {
  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.45 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));
} else {
  counters.forEach(animateCounter);
}

/* =========================================================
   Scroll UI
========================================================= */

function updateProgress() {
  if (!progressBar) return;

  const maxScroll =
    document.documentElement.scrollHeight - window.innerHeight;

  const percent =
    maxScroll > 0 ? Math.min((window.scrollY / maxScroll) * 100, 100) : 0;

  progressBar.style.width = `${percent}%`;
}

function updateHeader() {
  if (!header) return;

  const current = window.scrollY;

  header.classList.toggle("scrolled", current > 30);

  if (current > 520 && !document.body.classList.contains("menu-open")) {
    header.classList.toggle(
      "header-hidden",
      current > lastScrollY && current - lastScrollY > 1
    );
  } else {
    header.classList.remove("header-hidden");
  }

  lastScrollY = current;
}

function updateActiveNav() {
  if (!sections.length) return;

  const marker = window.innerHeight * 0.34;
  let activeId = "home";

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();

    if (rect.top <= marker && rect.bottom >= marker) {
      activeId = section.id;
    }
  });

  navLinks.forEach((link) => {
    link.classList.toggle(
      "active",
      link.getAttribute("href") === `#${activeId}`
    );
  });
}

function updateHeroParallax() {
  if (!heroImage || reducedMotion.matches || window.innerWidth <= 768) return;

  const distance = Math.min(window.scrollY, window.innerHeight);
  const translate = distance * 0.028;

  heroImage.style.transform =
    `scale(1.045) translate3d(0, ${translate}px, 0)`;
}

function updateScrollUI() {
  updateProgress();
  updateHeader();
  updateActiveNav();
  updateHeroParallax();
  ticking = false;
}

window.addEventListener(
  "scroll",
  () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateScrollUI);
  },
  { passive: true }
);

window.addEventListener(
  "resize",
  () => {
    if (window.innerWidth > 1000) setMenu(false);
    requestAnimationFrame(updateScrollUI);
  },
  { passive: true }
);

updateScrollUI();

/* =========================================================
   Smooth internal navigation
========================================================= */

qsa('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const targetId = anchor.getAttribute("href");
    if (!targetId || targetId === "#") return;

    const target = qs(targetId);
    if (!target) return;

    event.preventDefault();

    target.scrollIntoView({
      behavior: reducedMotion.matches ? "auto" : "smooth",
      block: "start"
    });
  });
});

/* =========================================================
   Image loading fade
========================================================= */

qsa("img").forEach((image) => {
  if (image.complete) return;

  image.dataset.loading = "true";

  image.addEventListener(
    "load",
    () => {
      image.dataset.loading = "false";
    },
    { once: true }
  );

  image.addEventListener(
    "error",
    () => {
      image.dataset.loading = "false";
    },
    { once: true }
  );
});

/* =========================================================
   Desktop custom cursor
========================================================= */

const cursorDot = qs("#cursorDot");
const cursorRing = qs("#cursorRing");

if (
  supportsHover.matches &&
  cursorDot &&
  cursorRing &&
  !reducedMotion.matches
) {
  let mouseX = -100;
  let mouseY = -100;
  let ringX = -100;
  let ringY = -100;

  document.body.classList.add("cursor-ready");

  window.addEventListener(
    "pointermove",
    (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;

      cursorDot.style.transform =
        `translate3d(${mouseX - 2.5}px, ${mouseY - 2.5}px, 0)`;
    },
    { passive: true }
  );

  function renderRing() {
    ringX += (mouseX - ringX) * 0.16;
    ringY += (mouseY - ringY) * 0.16;

    cursorRing.style.transform =
      `translate3d(${ringX - 17}px, ${ringY - 17}px, 0)`;

    requestAnimationFrame(renderRing);
  }

  renderRing();

  qsa("a, button, .tilt-card").forEach((element) => {
    element.addEventListener("pointerenter", () => {
      document.body.classList.add("cursor-hover");
    });

    element.addEventListener("pointerleave", () => {
      document.body.classList.remove("cursor-hover");
    });
  });
}

/* =========================================================
   Magnetic buttons / desktop only
========================================================= */

if (supportsHover.matches && !reducedMotion.matches) {
  qsa(".magnetic").forEach((button) => {
    button.addEventListener("pointermove", (event) => {
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;

      button.style.transform =
        `translate3d(${x * 0.08}px, ${y * 0.10}px, 0)`;
    });

    button.addEventListener("pointerleave", () => {
      button.style.transform = "";
    });
  });
}

/* =========================================================
   Lightweight card tilt / desktop only
========================================================= */

if (supportsHover.matches && !reducedMotion.matches) {
  qsa(".tilt-card").forEach((card) => {
    let frameId = 0;

    card.addEventListener("pointermove", (event) => {
      cancelAnimationFrame(frameId);

      frameId = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();

        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;

        const rotateY = x * 2.4;
        const rotateX = y * -2.4;

        card.style.transform =
          `perspective(1100px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
      });
    });

    card.addEventListener("pointerleave", () => {
      cancelAnimationFrame(frameId);
      card.style.transform = "";
    });
  });
}

/* =========================================================
   Pause animations when tab is hidden
========================================================= */

document.addEventListener("visibilitychange", () => {
  if (!galleryTrack) return;

  galleryTrack.style.animationPlayState =
    document.hidden ? "paused" : "running";
});
