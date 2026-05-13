(function () {
  const burger = document.querySelector(".navbar-burger");
  const menu = document.getElementById("page-menu");

  if (burger && menu) {
    burger.addEventListener("click", () => {
      const isActive = burger.classList.toggle("is-active");
      menu.classList.toggle("is-active", isActive);
      burger.setAttribute("aria-expanded", String(isActive));
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        burger.classList.remove("is-active");
        menu.classList.remove("is-active");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  const copyButton = document.querySelector("[data-copy-bibtex]");
  const bibtex = document.getElementById("bibtex-code");

  if (copyButton && bibtex) {
    copyButton.addEventListener("click", async () => {
      const originalText = copyButton.querySelector("span:last-child").textContent;
      try {
        await navigator.clipboard.writeText(bibtex.textContent.trim());
        copyButton.querySelector("span:last-child").textContent = "Copied";
      } catch (error) {
        copyButton.querySelector("span:last-child").textContent = "Select text";
      }

      window.setTimeout(() => {
        copyButton.querySelector("span:last-child").textContent = originalText;
      }, 1800);
    });
  }

  const navLinks = Array.from(document.querySelectorAll(".navbar-end .navbar-item"));
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          navLinks.forEach((link) => {
            link.classList.toggle("is-active", link.getAttribute("href") === "#" + entry.target.id);
          });
        });
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
  }
})();
