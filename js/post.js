// post.js – Página de artigo individual com capa responsiva
(function () {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get("id"), 10);

  const container = document.getElementById("article-content");
  if (!container) return;

  // Skeleton inicial (CLS fix)
  container.classList.add("loading");
  container.innerHTML = `
    <div class="skeleton skel-cover"></div>
    <div class="skeleton skel-title"></div>
    <div class="skeleton skel-meta"></div>
  `;

  // Função util: gera <picture> responsivo
  function buildResponsiveImage(basePath, alt, aspect = "16/9") {
    return `
      <picture style="--cover-aspect:${aspect}">
        <source 
          type="image/webp" 
          srcset="${basePath}-400.webp 400w, ${basePath}-800.webp 800w" 
          sizes="(max-width: 768px) 100vw, 800px">
        <source 
          type="image/jpeg" 
          srcset="${basePath}-400.jpg 400w, ${basePath}-800.jpg 800w" 
          sizes="(max-width: 768px) 100vw, 800px">
        <img 
          class="article-cover"
          src="${basePath}-800.jpg"
          alt="${alt}"
          width="800" height="450"
          decoding="async" fetchpriority="high">
      </picture>
    `;
  }

  // Renderiza card relacionado
  function buildRelatedCard(a) {
    return `
      <article class="related-card">
        <div class="related-image">
          <picture>
            <source 
              type="image/webp" 
              srcset="${a.image}-320.webp 320w, ${a.image}-400.webp 400w" 
              sizes="(max-width: 480px) 100vw, 400px">
            <source 
              type="image/jpeg" 
              srcset="${a.image}-320.jpg 320w, ${a.image}-400.jpg 400w" 
              sizes="(max-width: 480px) 100vw, 400px">
            <img src="${a.image}-400.jpg" 
              alt="${a.title}" 
              width="400" height="225" 
              loading="lazy" decoding="async">
          </picture>
        </div>
        <div class="related-content">
          <span class="related-category">${a.category}</span>
          <h3><a href="blog-post.html?id=${a.id}">${a.title}</a></h3>
          <p>${a.excerpt}</p>
        </div>
      </article>
    `;
  }

  // Fetch dos artigos
  fetch("articles.json")
    .then(r => {
      if (!r.ok) throw new Error("Erro ao carregar JSON");
      return r.json();
    })
    .then(data => {
      const article = data.find(a => a.id === id);

      if (!article) {
        container.innerHTML = `
          <h2>Artigo não encontrado</h2>
          <p>Volte ao <a href="blog.html">blog</a> para explorar outros artigos.</p>
        `;
        return;
      }

      // SEO dinâmico
      document.title = `${article.title} | IsmaelDev Blog`;
      const desc = article.excerpt || "";
      const metas = [
        { property: "og:title", content: article.title },
        { property: "og:description", content: desc },
        { property: "og:image", content: `${article.image}-800.jpg` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: article.title },
        { name: "twitter:description", content: desc },
        { name: "twitter:image", content: `${article.image}-800.jpg` }
      ];
      metas.forEach(t => {
        const m = document.createElement("meta");
        if (t.property) m.setAttribute("property", t.property);
        if (t.name) m.setAttribute("name", t.name);
        m.setAttribute("content", t.content);
        document.head.appendChild(m);
      });

      // Tags
      const tagsHTML = (article.tags || [])
        .map(tag => `<a href="blog.html?tag=${encodeURIComponent(tag)}" class="tag">#${tag}</a>`)
        .join(" ");

      // Referências
      const refsHTML = article.references?.length
        ? `
          <section class="references">
            <h3>Referências</h3>
            <ul>
              ${article.references.map(ref =>
                ref.startsWith("http")
                  ? `<li><a href="${ref}" target="_blank" rel="noopener">${ref}</a></li>`
                  : `<li>${ref}</li>`
              ).join("")}
            </ul>
          </section>
        `
        : "";

      // Relacionados
      const related = data
        .filter(a => a.id !== article.id && a.status === "published")
        .filter(a => (a.tags || []).some(tag => article.tags.includes(tag)))
        .slice(0, 3);

      const relatedHTML = related.length
        ? `
          <section class="related-posts">
            <h2>Artigos Relacionados</h2>
            <div class="related-grid">
              ${related.map(buildRelatedCard).join("")}
            </div>
          </section>
        `
        : "";

      // Render final
      container.innerHTML = `
        <header class="article-header">
          <h1 class="article-title">${article.title}</h1>
          <p class="article-meta">${article.date} · ${article.readTime}</p>
        </header>

        <div class="article-media">
          ${buildResponsiveImage(article.image, article.title, article.imageAspect || "16/9")}
        </div>

        <div class="article-content">
          ${marked.parse(article.content || "")}
        </div>

        <footer class="article-footer">
          <div class="tags">${tagsHTML}</div>
          ${refsHTML}
          <a href="blog.html" class="back-button">← Voltar ao Blog</a>
        </footer>

        ${relatedHTML}
      `;

      container.classList.remove("loading");
    })
    .catch(err => {
      console.error("Erro ao carregar artigo:", err);
      container.innerHTML = `
        <p role="alert">Erro ao carregar o artigo. Tente novamente mais tarde.</p>
        <a href="blog.html" class="back-button">← Voltar ao Blog</a>
      `;
    });
})();
