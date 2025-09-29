const $ = (l, t = document) => t.querySelector(l);
const $$ = (l, t = document) => Array.from(t.querySelectorAll(l));
const body = document.body;

(function () {
  const toggle = $("#menuToggle");
  const nav = $("#primary-navigation");
  if (!toggle || !nav) return;

  const links = Array.from(nav.querySelectorAll("a"));
  const mq = window.matchMedia?.("(min-width: 769px)");
  const isDesktop = () => mq?.matches ?? window.innerWidth >= 769;

  const setMenuState = (isOpen) => {
    if (isDesktop()) {
      nav.classList.remove("active");
      nav.setAttribute("data-state", "open");
      nav.setAttribute("aria-hidden", "false");
      toggle.setAttribute("aria-expanded", "false");
      body.classList.remove("menu-open");
      return;
    }

    nav.classList.toggle("active", isOpen);
    nav.setAttribute("data-state", isOpen ? "open" : "closed");
    nav.setAttribute("aria-hidden", String(!isOpen));
    toggle.setAttribute("aria-expanded", String(isOpen));
    body.classList.toggle("menu-open", isOpen);
  };

  const closeMenu = () => setMenuState(false);
  const toggleMenu = () => {
    if (isDesktop()) return;
    const isOpen = nav.getAttribute("data-state") === "open";
    setMenuState(!isOpen);
  };

  setMenuState(false);

  toggle.addEventListener("click", (event) => {
    if (isDesktop()) return;
    event.stopPropagation();
    toggleMenu();
    if (nav.getAttribute("data-state") === "open") {
      links[0]?.focus({ preventScroll: true });
    }
  });

  links.forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });

  document.addEventListener("keydown", (event) => {
    if (isDesktop()) return;
    if (event.key === "Escape") {
      closeMenu();
      toggle.focus({ preventScroll: true });
    }
  });

  document.addEventListener("click", (event) => {
    if (isDesktop()) return;
    const isOpen = nav.getAttribute("data-state") === "open";
    if (!isOpen) return;
    if (nav.contains(event.target) || toggle.contains(event.target)) return;
    closeMenu();
  });

  if (mq) {
    const handleMqChange = (event) => {
      if (event.matches) {
        closeMenu();
      }
    };

    mq.addEventListener?.("change", handleMqChange) ?? mq.addListener(handleMqChange);
  }
})();

(function () {
  const t = $(".navbar");
  if (!t) return;

  const e = () => {
    t.classList.toggle("scrolled", window.scrollY > 8);
  };

  e();
  window.addEventListener("scroll", e, { passive: true });
})();

(function () {
  const t = $("#darkToggle");
  const e = t?.querySelector("i");
  const r = (s) => {
    e &&
      (e.classList.toggle("fa-moon", !s),
      e.classList.toggle("fa-sun", s));
  };

  const n = (s, { persist: i = false } = {}) => {
    if (s === "dark") {
      body.classList.add("dark-mode");
      body.classList.remove("light-forced");
      r(true);
      i && localStorage.setItem("theme", "dark");
    } else if (s === "light") {
      body.classList.remove("dark-mode");
      body.classList.add("light-forced");
      r(false);
      i && localStorage.setItem("theme", "light");
    } else {
      localStorage.removeItem("theme");
      body.classList.remove("light-forced");
      const c = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
      body.classList.toggle("dark-mode", c);
      r(c);
    }
  };

  const m = localStorage.getItem("theme");
  n(m || "auto");

  window.matchMedia &&
    matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", () => {
      localStorage.getItem("theme") || n("auto");
    });

  t?.addEventListener("click", () => {
    const s = body.classList.contains("dark-mode");
    n(s ? "light" : "dark", { persist: true });
  });
})();

(function () {
  const t = $$('a[href^="#"]:not([href="#"])');
  const e = $(".navbar")?.offsetHeight || 0;

  t.forEach((r) => {
    r.addEventListener("click", (n) => {
      const m = r.getAttribute("href");
      const s = document.querySelector(m);

      if (!s) return;

      n.preventDefault();

      const c = s.getBoundingClientRect().top + window.scrollY - (e + 8);
      window.scrollTo({ top: c, behavior: "smooth" });
      history.pushState(null, "", m);
    });
  });
})();

(function () {
  const navLinks = new Map(
    $$('#primary-navigation a[href^="#"]').map((link) => [link.getAttribute('href').slice(1), link])
  );
  if (!navLinks.size) return;

  const sections = $$('main section[id]');
  if (!sections.length) return;

  const setActive = (id) => {
    navLinks.forEach((link, key) => {
      link.classList.toggle('active', key === id);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    },
    {
      rootMargin: '-45% 0px -45% 0px',
      threshold: 0.2
    }
  );

  sections.forEach((section) => observer.observe(section));

  const currentHash = location.hash.replace('#', '');
  if (currentHash && navLinks.has(currentHash)) {
    setActive(currentHash);
  } else {
    setActive(sections[0].id);
  }
})();
