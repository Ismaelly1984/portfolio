// js/scrollReveal.js

const initScrollReveal = (options = {}) => {
    const defaultOptions = {
      root: null, // viewport
      rootMargin: '0px 0px -50px 0px', // Inicia a observação 50px antes do final da viewport
      threshold: 0.1, // Quando 10% do elemento estiver visível
      once: true // Animar apenas uma vez
    };
  
    const config = { ...defaultOptions, ...options };
  
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target;
          const animation = target.dataset.animation || 'fade-in-up';
          const delay = target.dataset.delay || 0;
          const duration = target.dataset.duration || 600;
  
          // Adiciona as classes de animação e inline styles
          target.classList.add(`animate-${animation}`);
          target.style.animationDelay = `${delay}ms`;
          target.style.animationDuration = `${duration}ms`;
          target.classList.remove('opacity-0'); // Garante que a opacidade inicial seja 0 se não for handled pela animação
  
          if (config.once) {
            observer.unobserve(target); // Para de observar após a animação
          }
        } else if (!config.once) {
          // Se não for 'once', remove as classes quando o elemento sai da viewport
          const target = entry.target;
          const animation = target.dataset.animation || 'fade-in-up';
          target.classList.remove(`animate-${animation}`);
          target.classList.add('opacity-0');
          target.style.animationDelay = ''; // Remove styles para resetar
          target.style.animationDuration = '';
        }
      });
    }, config);
  
    // Seleciona todos os elementos que devem ser revelados
    // Você precisará adicionar um atributo 'data-reveal' ou similar nos seus elementos HTML
    document.querySelectorAll('[data-reveal]').forEach(element => {
      element.classList.add('opacity-0'); // Garante que estejam invisíveis antes de animar
      observer.observe(element);
    });
  };
  
  // Exporta a função para ser chamada em main.js
  export { initScrollReveal };