// =========================
// PAGE LOADER
// =========================

window.addEventListener("load", () => {
  const loader = document.getElementById("loader");

  setTimeout(() => {
    loader.classList.add("hide");
  }, 700);
});


// =========================
// CURRENT YEAR
// =========================

const year = document.getElementById("year");

if (year) {
  year.textContent = new Date().getFullYear();
}


// =========================
// HEADER SCROLL EFFECT
// =========================

const header = document.getElementById("header");

window.addEventListener("scroll", () => {
  if (window.scrollY > 40) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});


// =========================
// MOBILE MENU
// =========================

const menuBtn = document.getElementById("menuBtn");
const nav = document.getElementById("nav");
const navLinks = document.querySelectorAll(".nav-link");

menuBtn.addEventListener("click", () => {
  nav.classList.toggle("open");
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
  });
});


// =========================
// REVEAL ON SCROLL
// =========================

const revealElements = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  {
    threshold: 0.15,
  }
);

revealElements.forEach((element) => {
  revealObserver.observe(element);
});


// =========================
// COUNTER ANIMATION
// =========================

const counters = document.querySelectorAll(".counter");

const counterObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const counter = entry.target;
      const target = Number(counter.dataset.target);

      let current = 0;

      const duration = 1600;
      const interval = 20;
      const steps = duration / interval;

      const increment = target / steps;

      const timer = setInterval(() => {
        current += increment;

        if (current >= target) {
          current = target;
          clearInterval(timer);
        }

        if (target >= 1000) {
          counter.textContent =
            Math.floor(current / 100) / 10 + "K+";
        } else {
          counter.textContent =
            Math.floor(current) + "+";
        }
      }, interval);

      observer.unobserve(counter);
    });
  },
  {
    threshold: 0.5,
  }
);

counters.forEach((counter) => {
  counterObserver.observe(counter);
});


// =========================
// ACTIVE NAV LINK
// =========================

const sections = document.querySelectorAll("section[id]");

window.addEventListener("scroll", () => {
  let currentSection = "";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 180;

    if (window.scrollY >= sectionTop) {
      currentSection = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");

    if (
      link.getAttribute("href") ===
      `#${currentSection}`
    ) {
      link.classList.add("active");
    }
  });
});


// =========================
// SMOOTH ANCHOR SCROLL
// =========================

document
  .querySelectorAll('a[href^="#"]')
  .forEach((anchor) => {
    anchor.addEventListener("click", function (event) {
      const targetId = this.getAttribute("href");

      if (targetId === "#") return;

      const target = document.querySelector(targetId);

      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  });


// =========================
// SIMPLE PARALLAX EFFECT
// =========================

const heroImage =
  document.querySelector(".hero-bg img");

window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;

  if (heroImage && scrollY < window.innerHeight) {
    heroImage.style.transform =
      `scale(1.05) translateY(${scrollY * 0.08}px)`;
  }
});


// =========================
// REEL CARD MOUSE EFFECT
// =========================

const reelCards =
  document.querySelectorAll(".reel-card");

reelCards.forEach((card) => {
  card.addEventListener("mousemove", (event) => {
    const rect = card.getBoundingClientRect();

    const x =
      event.clientX - rect.left;

    const y =
      event.clientY - rect.top;

    const centerX =
      rect.width / 2;

    const centerY =
      rect.height / 2;

    const rotateX =
      ((y - centerY) / centerY) * -2;

    const rotateY =
      ((x - centerX) / centerX) * 2;

    card.style.transform =
      `perspective(900px)
       rotateX(${rotateX}deg)
       rotateY(${rotateY}deg)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform =
      "perspective(900px) rotateX(0deg) rotateY(0deg)";
  });
});


// =========================
// PAGE READY
// =========================

document.addEventListener(
  "DOMContentLoaded",
  () => {
    document.body.classList.add("ready");
  }
);