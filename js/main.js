// js/main.js
import { initScrollReveal } from './scrollReveal.js'; 
// Inicializa o ScrollReveal com opções personalizadas
initScrollReveal({
  root: null, // viewport
  rootMargin: '0px 0px -50px 0px', // Inicia a observação 50px antes do final da viewport
  threshold: 0.1, // Quando 10% do elemento estiver visível
  once: true // Animar apenas uma vez
});

document.addEventListener('DOMContentLoaded', () => {
    // --- Header Scroll Effect ---
    const header = document.getElementById('header-section');
    const scrollThreshold = 50;
  
    const handleScroll = () => {
      if (window.scrollY > scrollThreshold) {
        header.classList.add('bg-white/95', 'backdrop-blur-sm', 'shadow-lg');
        header.classList.remove('bg-transparent');
      } else {
        header.classList.remove('bg-white/95', 'backdrop-blur-sm', 'shadow-lg');
        header.classList.add('bg-transparent');
      }
    };
  
    window.addEventListener('scroll', handleScroll);
    // Chamar uma vez ao carregar caso a página já inicie rolada
    handleScroll();
  
    // --- Mobile Menu Toggle ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
  
    mobileMenuButton.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
      // Você pode trocar o ícone aqui se quiser, usando SVG do 'x' e 'menu'
      // Ex: mobileMenuButton.innerHTML = mobileMenu.classList.contains('hidden') ? '<svg ...menu...>' : '<svg ...x...>';
    });
  
    // --- Smooth Scrolling for Navigation Links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
  
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
  
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - (header.offsetHeight || 0), // Ajusta para a altura do header fixo
            behavior: 'smooth'
          });
          // Fechar menu móvel após clique
          if (!mobileMenu.classList.contains('hidden')) {
              mobileMenu.classList.add('hidden');
          }
        }
      });
    });
    // --- Hero Section: Scroll to Next Section ---
    const scrollToNextButton = document.getElementById('scroll-to-next-section');
    if (scrollToNextButton) {
      scrollToNextButton.addEventListener('click', () => {
        const aboutSection = document.getElementById('about');
        if (aboutSection) {
          window.scrollTo({
            top: aboutSection.offsetTop - (header.offsetHeight || 0), // Ajusta para a altura do header fixo
            behavior: 'smooth'
          });
        }
      });
    }
    // --- Add other global JS functions here (e.g., ScrollReveal if needed) ---
  });

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contact-form');
    const submissionMessage = document.getElementById('submission-message');

    form.addEventListener('submit', function(event) {
      event.preventDefault(); // Impede o envio padrão do formulário

      // Simula um atraso no envio
      setTimeout(() => {
        submissionMessage.classList.remove('hidden'); // Mostra a mensagem de sucesso
        form.reset(); // Limpa os campos do formulário

        // Opcional: Esconde a mensagem após alguns segundos
        setTimeout(() => {
          submissionMessage.classList.add('hidden');
        }, 3000); // Esconde após 3 segundos
      }, 1000); // Simula 1 segundo de "processamento"
    });
  });

  document.addEventListener('DOMContentLoaded', () => {
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
      currentYearSpan.textContent = new Date().getFullYear();
    }
  });