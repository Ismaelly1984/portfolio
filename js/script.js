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
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const menuToggle = $('#menuToggle');                 // <button>
const navMenu = $('#primary-navigation');         // <ul>
const darkToggle = $('#darkToggle');
const contactForm = $('#contactForm');
const body = document.body;

/* ========= MENU MOBILE (A11y) ========= */
if (menuToggle && navMenu) {
  let focusables = [];
  let firstEl = null;
  let lastEl = null;

  const refreshFocusables = () => {
    focusables = $$('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])', navMenu)
      .filter(el => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'));
    firstEl = focusables[0] || null;
    lastEl = focusables[focusables.length - 1] || null;
  };

  const trapTabKey = (e) => {
    if (e.key !== 'Tab' || focusables.length === 0) return;
    const isFirst = document.activeElement === firstEl;
    const isLast = document.activeElement === lastEl;
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
*/(function setupTheme() {
  const body = document.body;
  const darkToggle = document.getElementById('darkToggle');
  const icon = darkToggle?.querySelector('i');
  const themeMeta = document.querySelector('meta[name="theme-color"]');

  const THEME_COLORS = {
    light: '#6366f1', // igual ao seu primário
    dark: '#0f172a', // combine com seu fundo no escuro
  };

  const safeGet = (key) => {
    try { return localStorage.getItem(key); } catch { return null; }
  };
  const safeSet = (key, val) => {
    try { localStorage.setItem(key, val); } catch { }
  };
  const safeRemove = (key) => {
    try { localStorage.removeItem(key); } catch { }
  };

  const systemPrefersDark = () =>
    !!(window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);

  const setIcon = (isDark) => {
    if (!icon) return;
    icon.classList.toggle('fa-moon', !isDark);
    icon.classList.toggle('fa-sun', isDark);
    darkToggle.setAttribute('aria-label', isDark ? 'Alternar para tema claro' : 'Alternar para tema escuro');
    darkToggle.setAttribute('title', isDark ? 'Tema claro' : 'Tema escuro');
  };

  const setThemeColorMeta = (isDark) => {
    if (!themeMeta) return;
    themeMeta.setAttribute('content', isDark ? THEME_COLORS.dark : THEME_COLORS.light);
  };

  const applyTheme = (mode, { persist = false } = {}) => {
    let isDark = false;

    if (mode === 'dark') {
      body.classList.add('dark-mode');
      body.classList.remove('light-forced');
      isDark = true;
      if (persist) safeSet('theme', 'dark');
    } else if (mode === 'light') {
      body.classList.remove('dark-mode');
      body.classList.add('light-forced');
      isDark = false;
      if (persist) safeSet('theme', 'light');
    } else {
      // auto: segue o sistema
      safeRemove('theme');
      body.classList.remove('light-forced');
      isDark = systemPrefersDark();
      body.classList.toggle('dark-mode', isDark);
    }

    // Mantém <html> em sincronia para evitar flash residual
    document.documentElement.classList.toggle('dark-mode', isDark);
    document.documentElement.classList.toggle('light-forced', !isDark && body.classList.contains('light-forced'));

    setIcon(isDark);
    setThemeColorMeta(isDark);
  };

  // Tema inicial
  const stored = safeGet('theme'); // 'dark' | 'light' | null
  applyTheme(stored ?? 'auto');

  // Reage à mudança do sistema quando em "auto"
  if (window.matchMedia) {
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const onSysChange = () => { if (!safeGet('theme')) applyTheme('auto'); };
    mq.addEventListener ? mq.addEventListener('change', onSysChange)
      : mq.addListener && mq.addListener(onSysChange); // suporte antigo
  }

  // Clique do botão
  darkToggle?.addEventListener('click', () => {
    const isDark = body.classList.contains('dark-mode');
    applyTheme(isDark ? 'light' : 'dark', { persist: true });
  });

  // Sincroniza escolha entre múltiplas abas
  window.addEventListener('storage', (e) => {
    if (e.key === 'theme') {
      applyTheme(e.newValue ?? 'auto');
    }
  });
})();

/* ========= PÓS-LOAD: revelar subtítulo (mantém LCP no h1) ========= */
window.addEventListener('load', () => {
  document.querySelector('.hero-subtitle')?.classList.add('is-visible');
});
