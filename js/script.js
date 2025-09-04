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

(function () {
  const t = $("#contact") || $("#contactContent")?.closest("#contact") || $(".contact");
  const e = $("#contactForm");
  if (!t || !e) return;

  let r = false;

  const n = () => new Promise((i, c) => {
    if (window.emailjs) {
      i();
      return;
    }

    const d = document.createElement("script");
    d.src = "https://cdn.jsdelivr.net/npm/emailjs-com@3/dist/email.min.js";
    d.defer = true;
    d.onload = () => i();
    d.onerror = () => c(new Error("Falha ao carregar EmailJS"));
    document.head.appendChild(d);
  });

  const m = () => {
    const i = "service_xxx";
    const c = "template_xxx";

    window.emailjs && window.emailjs.init && window.emailjs.init("sua_public_key_xxx");

    const g = $("#formStatus");

    const u = (a, o = true) => {
      g
        ? (g.textContent = a, g.className = o ? "status ok" : "status error")
        : alert(a);
    };

    const h = () => {
      const a = e.querySelector('input[name="website"]');
      return a && a.value.trim() !== "";
    };

    const w = () => {
      const a = $$('[data-required="true"]', e);
      for (const f of a) if (!f.value || !f.value.trim()) return f.focus(), { ok: false, msg: "Preencha todos os campos obrigatórios." };

      const o = e.querySelector('input[type="email"]');
      return o && !/^\S+@\S+\.\S+$/.test(o.value)
        ? (o.focus(), { ok: false, msg: "Informe um e-mail válido." })
        : { ok: true };
    };

    const p = () => e.querySelector('button[type="submit"]');
    const v = (a) => {
      const o = p();
      o &&
        (a
          ? ((o.dataset.originalText = o.innerHTML),
            (o.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...',
            o.disabled = true))
          : ((o.innerHTML = o.dataset.originalText || "Enviar"),
            (o.disabled = false)));
    };

    e.addEventListener("submit", async (a) => {
      a.preventDefault();

      if (h()) {
        u("Falha no envio.", false);
        return;
      }

      const o = w();
      if (!o.ok) {
        u(o.msg, false);
        return;
      }

      if (!window.emailjs || typeof window.emailjs.sendForm !== "function") {
        u("Serviço de e-mail indisponível. Tente novamente.", false);
        return;
      }

      v(true);

      try {
        await window.emailjs.sendForm(i, c, e);
        u("Mensagem enviada com sucesso! 😊", true);
        e.reset();
      } catch (f) {
        console.error("EmailJS error:", f);
        u("Erro ao enviar. Tente novamente.", false);
      } finally {
        v(false);
      }
    });
  };

  new IntersectionObserver(async (i, c) => {
    if (i[0].isIntersecting && !r) {
      r = true;
      c.disconnect();

      try {
        await n();
        m();
      } catch (d) {
        console.warn(d);
      }
    }
  }, { rootMargin: "200px" }).observe(t);
})();

(function () {
  const FORM_ID = "contactForm";
  const PUBLIC_KEY = "SEU_PUBLIC_KEY_EMAILJS"; // <-- coloque o seu
  let loaded = false;

  function loadEmailJs(cb) {
    if (loaded) return cb?.();
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/emailjs-com@3/dist/email.min.js";
    s.defer = true;
    s.onload = () => {
      loaded = true;
      try {
        window.emailjs?.init(PUBLIC_KEY);
      } catch (e) {}
      cb?.();
    };
    document.head.appendChild(s);
  }

  const form = document.getElementById(FORM_ID);
  if (form && "IntersectionObserver" in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          loadEmailJs();
          obs.disconnect();
        }
      });
    }, { rootMargin: "300px" });
    obs.observe(form);
  }

  form?.addEventListener("submit", (ev) => {
    if (!loaded) {
      ev.preventDefault();
      loadEmailJs(() => form.requestSubmit()); // reenvia quando pronto
    }
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
