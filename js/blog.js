// blog.js – Listagem de artigos com busca + paginação + filtro por tag
(function () {
  const POSTS_PER_PAGE = 3;
  let allArticles = [];
  let currentPage = 1;
  let filteredArticles = [];

  const container = document.getElementById("articles-container");
  const paginationContainer = document.createElement("div");
  paginationContainer.className = "pagination";

  if (!container) return;

  // Função: retorna classe CSS baseada na categoria
  function getCategoryClass(category) {
    switch ((category || "").toLowerCase()) {
      case "react": return "category-react";
      case "carreira": return "category-carreira";
      case "ia": return "category-ia";
      case "pwa": return "category-pwa";
      default: return "category-default";
    }
  }

  // Renderizar artigos
  function renderArticles(articles, clear = true) {
    if (clear) container.innerHTML = "";
    const fragment = document.createDocumentFragment();

    articles.forEach(article => {
      const {
        id,
        title,
        excerpt,
        category,
        date,
        readTime,
        featured,
        author,
        tags = []
      } = article;

      const categoryClass = getCategoryClass(category);

      const card = document.createElement("article");
      card.className = "post-card" + (featured ? " featured" : "");
      card.innerHTML = `
        <div class="post-title-banner ${categoryClass}">
          <h2><a href="blog-post.html?id=${id}">${title}</a></h2>
        </div>
        <div class="post-content">
          <p class="post-excerpt">${excerpt}</p>
          <div class="post-meta">
            <span class="post-author">
              <img src="images/avatar-ismael.jpg" alt="Foto de ${author}" class="author-avatar">
              ${author}
            </span>
            <span>${date}</span>
            <span>${readTime}</span>
          </div>
          <div class="tags">
            ${tags.map(tag => `
              <a href="blog.html?tag=${encodeURIComponent(tag.toLowerCase())}" class="tag">#${tag}</a>
            `).join(" ")}
          </div>
          <a href="blog-post.html?id=${id}" class="read-more">
            Ler mais <i class="fas fa-arrow-right"></i>
          </a>
        </div>
      `;
      fragment.appendChild(card);
    });

    container.appendChild(fragment);
  }

  // Renderizar paginação
  function renderPagination(totalPages) {
    paginationContainer.innerHTML = "";

    function addButton(label, page, disabled = false, active = false) {
      const btn = document.createElement("button");
      btn.textContent = label;
      btn.className = active ? "page-numbers current" : "page-numbers";
      btn.disabled = disabled;
      btn.addEventListener("click", () => {
        if (!disabled && currentPage !== page) {
          currentPage = page;
          updateUI();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
      paginationContainer.appendChild(btn);
    }

    function addEllipsis() {
      const span = document.createElement("span");
      span.textContent = "...";
      span.className = "ellipsis";
      paginationContainer.appendChild(span);
    }

    if (totalPages <= 1) return;

    // Botão anterior
    addButton("«", currentPage - 1, currentPage === 1);

    const visiblePages = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);

    if (end - start < visiblePages - 1) {
      if (start === 1) {
        end = Math.min(totalPages, start + visiblePages - 1);
      } else if (end === totalPages) {
        start = Math.max(1, end - visiblePages + 1);
      }
    }

    if (start > 1) {
      addButton("1", 1, false, currentPage === 1);
      if (start > 2) addEllipsis();
    }

    for (let i = start; i <= end; i++) {
      addButton(i, i, false, i === currentPage);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) addEllipsis();
      addButton(totalPages, totalPages, false, currentPage === totalPages);
    }

    // Botão próximo
    addButton("»", currentPage + 1, currentPage === totalPages);

    if (!paginationContainer.parentNode) {
      container.parentNode.appendChild(paginationContainer);
    }
  }

  // Atualizar UI
  function updateUI() {
    const start = (currentPage - 1) * POSTS_PER_PAGE;
    const end = start + POSTS_PER_PAGE;
    renderArticles(filteredArticles.slice(start, end));
    renderPagination(Math.ceil(filteredArticles.length / POSTS_PER_PAGE));
  }

  // Aplicar filtros por busca/tag
  function applyFilter() {
    const term = (document.getElementById("searchInput")?.value || "").toLowerCase().trim();
    const params = new URLSearchParams(window.location.search);
    const tagParam = params.get("tag");

    filteredArticles = allArticles.filter(a => {
      const title = a.title.toLowerCase();
      const tags = (a.tags || []).map(t => t.toLowerCase());

      const matchSearch = term ? (title.includes(term) || tags.some(t => t.includes(term))) : true;
      const matchTag = tagParam ? tags.includes(tagParam.toLowerCase()) : true;

      return matchSearch && matchTag;
    });

    currentPage = 1;
    updateUI();
  }

  // Buscar artigos
  fetch("articles.json")
    .then(res => res.json())
    .then(data => {
      allArticles = data
        .filter(a => a.status === "published")
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      const params = new URLSearchParams(window.location.search);
      const searchParam = params.get("search");
      const tagParam = params.get("tag");

      if (searchParam) {
        document.getElementById("searchInput").value = searchParam;
      }

      filteredArticles = [...allArticles];
      applyFilter();
    })
    .catch(err => {
      console.error("Erro ao carregar artigos:", err);
      container.innerHTML = "<p role='alert'>Erro ao carregar artigos. Tente novamente mais tarde.</p>";
    });

  // Busca com debounce
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    const debounce = (fn, delay = 200) => {
      let timer;
      return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
      };
    };
    searchInput.addEventListener("input", debounce(() => {
      const params = new URLSearchParams(window.location.search);
      params.set("search", searchInput.value.trim());
      history.replaceState(null, "", "?" + params.toString());
      applyFilter();
    }, 200));
  }
})();
