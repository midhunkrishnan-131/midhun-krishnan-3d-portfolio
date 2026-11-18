/**
 * Midhun Krishnan Portfolio — Standalone Interactions
 * Clean vanilla JavaScript: ScrollSpy, Mobile Navigation, Smooth Interactions
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Navigation Active State on Scroll (Scrollspy)
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-links a");

  function updateActiveNav() {
    const scrollY = window.pageYOffset;

    sections.forEach((current) => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute("id");

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach((link) => {
          link.classList.remove("active");
          if (link.getAttribute("href") === `#${sectionId}`) {
            link.classList.add("active");
          }
        });
      }
    });
  }

  window.addEventListener("scroll", updateActiveNav, { passive: true });
  updateActiveNav();

  // 2. Smooth Scroll for internal anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

  // 3. Subtle Pointer Parallax on Artwork Panels
  const artPanels = document.querySelectorAll(".art-panel");
  artPanels.forEach((panel) => {
    panel.addEventListener("mousemove", (e) => {
      const rect = panel.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const svg = panel.querySelector("svg");
      if (svg) {
        svg.style.transform = `translate(${x * 12}px, ${y * 12}px) rotate(${x * 3}deg)`;
        svg.style.transition = "transform 0.1s ease-out";
      }
    });

    panel.addEventListener("mouseleave", () => {
      const svg = panel.querySelector("svg");
      if (svg) {
        svg.style.transform = `translate(0px, 0px) rotate(0deg)`;
        svg.style.transition = "transform 0.4s ease-out";
      }
    });
  });

  // 4. Copy Email & Phone Helper
  window.copyText = function (text, buttonId) {
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById(buttonId);
      if (btn) {
        const original = btn.innerText;
        btn.innerText = "Copied!";
        setTimeout(() => {
          btn.innerText = original;
        }, 2000);
      }
    });
  };
});
