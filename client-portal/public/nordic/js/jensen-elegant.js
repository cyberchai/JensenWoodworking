(function () {
  function addRevealTargets() {
    var selectors = [
      ".sec-title",
      ".about-section .image-column",
      ".about-section .content-column",
      ".about-jensen-section .image-column",
      ".about-jensen-section .content-column",
      ".service-box",
      ".project-type-card",
      ".wood-species-card",
      ".process-step",
      ".testimonial-card",
      ".testimonial-block",
      ".home-contact-section .contact-form",
      ".contact-page-section .info-column",
      ".contact-page-section .form-column",
      ".professional-cta-section .cta-inner",
      ".professional-cta-section .sec-title",
      ".sponsors-section .image-box",
      ".instagram-reels-grid > *",
      ".main-footer .footer-widget"
    ];

    var elements = document.querySelectorAll(selectors.join(","));
    elements.forEach(function (element, index) {
      if (!element.classList.contains("elegant-reveal")) {
        element.classList.add("elegant-reveal");
      }
      element.style.setProperty("--reveal-delay", String((index % 6) * 90) + "ms");
    });

    if (!("IntersectionObserver" in window)) {
      elements.forEach(function (element) {
        element.classList.add("is-visible");
      });
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
        threshold: 0.16,
        rootMargin: "0px 0px -10% 0px"
      }
    );

    elements.forEach(function (element) {
      observer.observe(element);
    });
  }

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

  document.addEventListener("DOMContentLoaded", function () {
    addRevealTargets();
  });
})();
