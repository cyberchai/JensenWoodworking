(function () {
  var prefersReducedMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function toArray(list) {
    return Array.prototype.slice.call(list || []);
  }

  function unique(elements) {
    var seen = [];
    return elements.filter(function (element) {
      if (!element || seen.indexOf(element) !== -1) {
        return false;
      }
      seen.push(element);
      return true;
    });
  }

  function shouldSkip(element) {
    return !element ||
      element.classList.contains("luxury-motion-skip") ||
      element.closest(".mobile-menu, .scroll-to-top, .project-modal, .mCSB_scrollTools");
  }

  function markReveal(element, style, collection) {
    if (shouldSkip(element)) {
      return;
    }

    element.classList.add("elegant-reveal");

    if (style && !element.getAttribute("data-reveal-style")) {
      element.setAttribute("data-reveal-style", style);
    }

    collection.push(element);
  }

  function markImageReveal(element, collection) {
    if (shouldSkip(element)) {
      return;
    }

    element.classList.add("elegant-image-reveal");
    collection.push(element);
  }

  function assignDelays(elements) {
    var parentCounts = typeof WeakMap === "function" ? new WeakMap() : null;

    elements.forEach(function (element) {
      var parent = element.parentElement || document.body;
      var count = 0;

      if (parentCounts) {
        count = parentCounts.get(parent) || 0;
        parentCounts.set(parent, count + 1);
      } else {
        count = parent.__jensenRevealCount || 0;
        parent.__jensenRevealCount = count + 1;
      }

      element.style.setProperty("--reveal-delay", String((count % 5) * 90) + "ms");
    });
  }

  function getRevealTargets() {
    var elements = [];
    var revealGroups = [
      {
        selector: ".banner-section .content-boxed h1, .banner-section .content-boxed .subtitle-h1, .page-banner-section .title, .page-banner-section h1, .testimonials-tagline",
        style: "headline"
      },
      {
        selector: ".sec-title, .testimonials-intro, .gallery-filter-wrapper, .gallery-cta-section .cta-inner, .professional-cta-section .cta-inner",
        style: "lift"
      },
      {
        selector: ".about-section .content-column .inner-column, .about-section .about-content-column .inner-column, .about-jensen-section .content-column .inner-column, .contact-page-section .info-column .inner-column, .contact-page-section .form-column .inner-column, .testimonial-panel, .testimonial-copy-panel",
        style: "soft"
      },
      {
        selector: ".testimonial-entry, .gallery-grid-item, .project-type-card, .wood-species-card, .process-step, .service-box, .contact-form .form-group, .instagram-spotlight, .instagram-cta-wrap, .instagram-reels-grid > *, .main-footer .footer-widget, .footer-bottom",
        style: "card"
      }
    ];

    var imageSelectors = [
      ".nordic-split-image",
      ".about-section .image-column",
      ".about-jensen-section .image-column",
      ".about-image-column",
      ".testimonial-media",
      ".gallery-block .image",
      ".sponsors-section .image-box"
    ];

    revealGroups.forEach(function (group) {
      toArray(document.querySelectorAll(group.selector)).forEach(function (element) {
        markReveal(element, group.style, elements);
      });
    });

    toArray(document.querySelectorAll(imageSelectors.join(", "))).forEach(function (element) {
      markImageReveal(element, elements);
    });

    elements = unique(elements);
    assignDelays(elements);
    return elements;
  }

  function revealElements(elements) {
    elements.forEach(function (element) {
      element.classList.add("is-visible");
    });
  }

  function startRevealObserver(elements) {
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealElements(elements);
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -8% 0px"
      }
    );

    elements.forEach(function (element) {
      observer.observe(element);
    });
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function startSubtleParallax() {
    if (prefersReducedMotion || !window.requestAnimationFrame) {
      return;
    }

    var elements = unique(toArray(document.querySelectorAll(
      ".banner-section .slide, .page-banner-section, .contact-hero-strip, .nordic-split-image"
    ))).filter(function (element) {
      return !shouldSkip(element);
    });

    if (!elements.length) {
      return;
    }

    elements.forEach(function (element) {
      element.classList.add("elegant-parallax-bg");
    });

    var ticking = false;

    function update() {
      var viewportHeight = window.innerHeight || document.documentElement.clientHeight;

      elements.forEach(function (element) {
        var rect = element.getBoundingClientRect();

        if (rect.bottom < -80 || rect.top > viewportHeight + 80) {
          return;
        }

        var distanceFromCenter = rect.top + rect.height / 2 - viewportHeight / 2;
        var shift = clamp(distanceFromCenter * -0.035, -24, 24);
        element.style.setProperty("--elegant-bg-shift", shift.toFixed(2) + "px");
      });

      ticking = false;
    }

    function requestUpdate() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
  }

  function initElegantMotion() {
    document.documentElement.classList.add("luxury-scroll-ready");
    startRevealObserver(getRevealTargets());
    startSubtleParallax();
  }

  window.JensenElegantMotion = {
    refresh: initElegantMotion
  };

  window.toggleTestimonial = function (button) {
    if (!button) {
      return;
    }

    if (window.event) {
      window.event.preventDefault();
      window.event.stopPropagation();
    }

    var card = button.closest(".testimonial-card");
    if (!card) {
      return;
    }

    card.classList.toggle("expanded");
    var expandText = button.querySelector(".expand-text");
    if (expandText) {
      expandText.textContent = card.classList.contains("expanded") ? "Read Less" : "Read More";
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initElegantMotion);
  } else {
    initElegantMotion();
  }
})();
