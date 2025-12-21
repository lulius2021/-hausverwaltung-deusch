/* assets/js/main.js
   Hausverwaltung Deusch – Global UI behaviour
   - Footer year
   - Hero parallax / fade
   - Scroll fade-in
   - Mobile navigation
   - Offer image slider (buttons, dots, swipe)
*/

(() => {
  "use strict";

  /* =========================
     FOOTER YEAR
  ========================= */
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* =========================
     HERO PARALLAX / FADE
  ========================= */
  const heroVisual = document.getElementById("hero-visual");
  if (heroVisual) {
    const onScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const max = 320;
      const progress = Math.min(scrollY / max, 1);

      heroVisual.style.transform =
        `scale(${1 + progress * 0.05}) translateY(${progress * 18}px)`;
      heroVisual.style.opacity = String(1 - progress * 0.75);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* =========================
     SCROLL FADE-IN
  ========================= */
  const fadeElements = document.querySelectorAll(".fade-in");
  if (fadeElements.length) {
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add("in-view");
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 }
      );

      fadeElements.forEach(el => observer.observe(el));
    } else {
      fadeElements.forEach(el => el.classList.add("in-view"));
    }
  }

  /* =========================
     MOBILE NAVIGATION
  ========================= */
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");

  if (navToggle && navLinks) {
    const isOpen = () => navLinks.classList.contains("open");

    const openMenu = () => {
      navLinks.classList.add("open");
      navToggle.setAttribute("aria-expanded", "true");
    };

    const closeMenu = () => {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    };

    navToggle.addEventListener("click", e => {
      e.preventDefault();
      isOpen() ? closeMenu() : openMenu();
    });

    navLinks.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", e => {
      if (!isOpen()) return;
      if (!navLinks.contains(e.target) && !navToggle.contains(e.target)) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && isOpen()) closeMenu();
    });

    window.addEventListener(
      "resize",
      () => {
        if (window.getComputedStyle(navToggle).display === "none" && isOpen()) {
          closeMenu();
        }
      },
      { passive: true }
    );
  }

  /* =========================
     OFFER IMAGE SLIDER
  ========================= */
  const slider = document.getElementById("offerSlider");
  if (slider) {
    const slides = Array.from(slider.querySelectorAll(".offer-slide"));
    const prevBtn = slider.querySelector(".offer-nav--prev");
    const nextBtn = slider.querySelector(".offer-nav--next");
    const dotsContainer = slider.querySelector(".offer-dots");

    let index = 0;
    let startX = 0;
    let isDragging = false;

    const showSlide = i => {
      slides.forEach((slide, idx) => {
        slide.classList.toggle("active", idx === i);
      });

      if (dotsContainer) {
        dotsContainer.querySelectorAll("button").forEach((dot, idx) => {
          dot.classList.toggle("active", idx === i);
        });
      }
    };

    const next = () => {
      index = (index + 1) % slides.length;
      showSlide(index);
    };

    const prev = () => {
      index = (index - 1 + slides.length) % slides.length;
      showSlide(index);
    };

    // Buttons
    if (prevBtn) prevBtn.addEventListener("click", prev);
    if (nextBtn) nextBtn.addEventListener("click", next);

    // Dots
    if (dotsContainer) {
      slides.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", `Bild ${i + 1}`);
        dot.addEventListener("click", () => {
          index = i;
          showSlide(index);
        });
        dotsContainer.appendChild(dot);
      });
      showSlide(index);
    }

    // Touch / Swipe
    slider.addEventListener("touchstart", e => {
      startX = e.touches[0].clientX;
      isDragging = true;
    });

    slider.addEventListener("touchend", e => {
      if (!isDragging) return;
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      if (Math.abs(diff) > 40) {
        diff > 0 ? next() : prev();
      }
      isDragging = false;
    });

    // Keyboard
    slider.addEventListener("keydown", e => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    });
  }
})();