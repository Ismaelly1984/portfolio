const $ = (l, t = document) => t.querySelector(l);
const $$ = (l, t = document) => Array.from(t.querySelectorAll(l));
const body = document.body;

(function () {
  const t = $("#menuToggle");
  const e = $(".nav-menu");
  if (!t || !e) return;

  const r = () => {
    const n = e.classList.toggle("active");
    t.setAttribute("aria-expanded", String(n));
  };

  t.addEventListener("click", r);
  $$(".nav-menu a").forEach((n) => {
    n.addEventListener("click", () => {
      e.classList.remove("active");
    });
  });
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

window.addEventListener("load", () => {
  document.getElementById("preloader")?.remove();
});

const currentPage = location.pathname.split("/").pop();
document.querySelectorAll(".nav-link").forEach(link => {
  if (link.getAttribute("href").includes(currentPage)) {
    link.classList.add("active");
  }
});
