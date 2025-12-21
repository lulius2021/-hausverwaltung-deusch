/* assets/js/main.js
   Hausverwaltung Deusch – Global UI behaviour
   - Hero parallax/fade
   - Scroll fade-in
   - Footer year
   - Mobile nav toggle + accessibility
*/

(() => {
  "use strict";

  // ---------- Footer Year ----------
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ---------- Hero parallax / fade ----------
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
    onScroll(); // init
  }

  // ---------- Scroll Fade-In ----------
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
      // Fallback for very old browsers
      fadeElements.forEach(el => el.classList.add("in-view"));
    }
  }

  // ---------- Mobile Nav Toggle ----------
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");

  const openMenu = () => {
    navLinks.classList.add("open");
    navToggle.setAttribute("aria-expanded", "true");
  };

  const closeMenu = () => {
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  };

  const isMenuOpen = () => navLinks.classList.contains("open");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", (e) => {
      e.preventDefault();
      isMenuOpen() ? closeMenu() : openMenu();
    });

    // Close on link click
    navLinks.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => {
        closeMenu();
      });
    });

    // Close on click outside (mobile)
    document.addEventListener("click", (e) => {
      if (!isMenuOpen()) return;
      const target = e.target;
      const clickedInsideNav = navLinks.contains(target) || navToggle.contains(target);
      if (!clickedInsideNav) closeMenu();
    });

    // Close on ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isMenuOpen()) closeMenu();
    });

    // Close menu when switching to desktop layout (optional safety)
    window.addEventListener("resize", () => {
      // When navToggle is hidden in desktop, ensure menu isn't stuck open
      const toggleStyle = window.getComputedStyle(navToggle);
      const toggleHidden = toggleStyle.display === "none";
      if (toggleHidden && isMenuOpen()) closeMenu();
    }, { passive: true });
  }
})();