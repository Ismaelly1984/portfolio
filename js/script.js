/* ========= CONFIGURAÇÃO EMAILJS =========
   1) Crie conta em https://www.emailjs.com/
   2) Substitua pelos seus IDs reais abaixo
*/
const SERVICE_ID = 'service_xxx';
const TEMPLATE_ID = 'template_xxx';
// Em contas mais novas é "public key" (ex: 'sua_public_key_xxx')
const EMAILJS_PUBLIC_KEY = 'sua_public_key_xxx';

// Inicializa EmailJS com chave pública (funciona mesmo se o SDK carregar depois)
(function initEmailJS() {
  const tryInit = () => {
    if (window.emailjs && typeof emailjs.init === 'function') {
      emailjs.init(EMAILJS_PUBLIC_KEY);
    }
  };
  // tenta agora e também ao DOMContentLoaded
  tryInit();
  document.addEventListener('DOMContentLoaded', tryInit);
})();

/* ========= SELECTORS ========= */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const menuToggle  = $('#menuToggle');                 // <button>
const navMenu     = $('#primary-navigation');         // <ul>
const darkToggle  = $('#darkToggle');
const contactForm = $('#contactForm');
const body        = document.body;

/* ========= MENU MOBILE (A11y) ========= */
if (menuToggle && navMenu) {
  let focusables = [];
  let firstEl = null;
  let lastEl  = null;

  const refreshFocusables = () => {
    focusables = $$('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])', navMenu)
      .filter(el => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'));
    firstEl = focusables[0] || null;
    lastEl  = focusables[focusables.length - 1] || null;
  };

  const trapTabKey = (e) => {
    if (e.key !== 'Tab' || focusables.length === 0) return;
    const isFirst = document.activeElement === firstEl;
    const isLast  = document.activeElement === lastEl;
    if (e.shiftKey && isFirst) { e.preventDefault(); lastEl?.focus(); }
    else if (!e.shiftKey && isLast) { e.preventDefault(); firstEl?.focus(); }
  };

  const escToClose = (e) => {
    if (e.key === 'Escape') closeMenu();
  };

  const openMenu = () => {
    navMenu.classList.add('active');
    menuToggle.setAttribute('aria-expanded', 'true');
    refreshFocusables();
    document.addEventListener('keydown', trapTabKey);
    document.addEventListener('keydown', escToClose);
    // foca primeiro item quando abre
    setTimeout(() => firstEl?.focus(), 0);
  };

  const closeMenu = () => {
    navMenu.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.removeEventListener('keydown', trapTabKey);
    document.removeEventListener('keydown', escToClose);
    // volta o foco pro botão
    menuToggle.focus();
  };

  const toggleMenu = () => {
    const open = navMenu.classList.contains('active');
    open ? closeMenu() : openMenu();
  };

  // clique, Enter e Espaço no botão
  menuToggle.addEventListener('click', toggleMenu);
  menuToggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleMenu(); }
  });

  // Fechar ao clicar em um link
  $$('#primary-navigation a').forEach(a => a.addEventListener('click', closeMenu));
}

/* ========= NAVBAR SCROLLED SHADOW ========= */
const navbar = $('.navbar');
if (navbar) {
  const onScroll = () => {
    if (window.scrollY > 8) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ========= DARK MODE =========
   - Guarda escolha do usuário em localStorage
   - Se não houver escolha, segue o sistema (auto)
*/
(function setupTheme() {
  const icon = darkToggle?.querySelector('i');
  const setIcon = (isDark) => {
    if (!icon) return;
    icon.classList.toggle('fa-moon', !isDark);
    icon.classList.toggle('fa-sun', isDark);
  };

  const systemPrefersDark = matchMedia?.('(prefers-color-scheme: dark)').matches;

  const applyTheme = (mode, { persist = false } = {}) => {
    if (mode === 'dark') {
      body.classList.add('dark-mode');
      body.classList.remove('light-forced');
      setIcon(true);
      if (persist) localStorage.setItem('theme', 'dark');
    } else if (mode === 'light') {
      body.classList.remove('dark-mode');
      body.classList.add('light-forced');
      setIcon(false);
      if (persist) localStorage.setItem('theme', 'light');
    } else {
      localStorage.removeItem('theme');
      body.classList.remove('light-forced');
      systemPrefersDark ? body.classList.add('dark-mode') : body.classList.remove('dark-mode');
      setIcon(systemPrefersDark);
    }
  };

  const stored = localStorage.getItem('theme'); // 'dark' | 'light' | null
  stored ? applyTheme(stored) : applyTheme('auto');

  if (matchMedia) {
    const mq = matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener?.('change', () => {
      if (!localStorage.getItem('theme')) applyTheme('auto');
    });
  }

  darkToggle?.addEventListener('click', () => {
    const isDark = body.classList.contains('dark-mode');
    applyTheme(isDark ? 'light' : 'dark', { persist: true });
  });
})();

/* ========= EMAILJS (envio do formulário) ========= */
if (contactForm) {
  const isSpam = () => {
    const hp = contactForm.querySelector('input[name="website"]');
    return hp && hp.value.trim() !== '';
  };

  const getSubmitButton = () => contactForm.querySelector('button[type="submit"]');

  const setSubmitting = (submitting) => {
    const btn = getSubmitButton();
    if (!btn) return;
    if (submitting) {
      btn.dataset.originalText = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
      btn.disabled = true;
    } else {
      btn.innerHTML = btn.dataset.originalText || 'Enviar';
      btn.disabled = false;
    }
  };

  const showStatus = (msg, ok = true) => {
    const statusEl = $('#formStatus');
    if (statusEl) {
      statusEl.textContent = msg;
      statusEl.className = ok ? 'status ok' : 'status error';
    } else {
      alert(msg);
    }
  };

  // Validação baseada em [required] (não depende de data-required)
  const validate = () => {
    const required = $$('[required]', contactForm);
    for (const el of required) {
      if (!el.value || !el.value.trim()) {
        el.focus();
        return { ok: false, msg: 'Por favor, preencha todos os campos obrigatórios.' };
      }
    }
    const email = contactForm.querySelector('input[type="email"]');
    if (email && !/^\S+@\S+\.\S+$/.test(email.value)) {
      email.focus();
      return { ok: false, msg: 'Informe um e-mail válido.' };
    }
    return { ok: true };
  };

  contactForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (isSpam()) {
      showStatus('Falha no envio.', false);
      return;
    }

    const v = validate();
    if (!v.ok) { showStatus(v.msg, false); return; }

    if (!window.emailjs || typeof emailjs.sendForm !== 'function') {
      showStatus('Serviço de e-mail indisponível. Tente novamente em instantes.', false);
      return;
    }

    setSubmitting(true);
    try {
      await emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, this);
      showStatus('Mensagem enviada com sucesso! 😊', true);
      this.reset();
    } catch (err) {
      console.error('EmailJS error:', err);
      showStatus('Erro ao enviar. Tente novamente.', false);
    } finally {
      setSubmitting(false);
    }
  });
}

/* ========= ROLAGEM SUAVE (offset da navbar fixa) ========= */
(function smoothScrollWithOffset() {
  const links = $$('a[href^="#"]:not([href="#"])');
  const targetOrNull = (hash) => { try { return document.querySelector(hash); } catch { return null; } };
  const getOffsetTop = (el) => {
    const rect = el.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const navH = $('.navbar')?.offsetHeight || 0;
    return rect.top + scrollTop - (navH + 8);
  };
  links.forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const hash = anchor.getAttribute('href');
      const target = targetOrNull(hash);
      if (!target) return;
      e.preventDefault();
      window.scrollTo({ top: getOffsetTop(target), behavior: 'smooth' });
      history.pushState(null, '', hash);
    });
  });
})();

/* ========= PÓS-LOAD: revelar subtítulo (mantém LCP no h1) ========= */
window.addEventListener('load', () => {
  document.querySelector('.hero-subtitle')?.classList.add('is-visible');
});
