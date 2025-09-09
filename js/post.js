// post.js – Artigo individual otimizado + relacionados com mini cards
const params = new URLSearchParams(window.location.search);
const id = parseInt(params.get("id"), 10);

// Função para montar imagens responsivas
function buildResponsiveImage(src, alt, sizes = ["400", "600", "800"]) {
  const name = src.replace(/\.(jpg|jpeg|png|webp)$/i, ""); 
  const webpSrcSet = sizes.map(s => `${name}-${s}.webp ${s}w`).join(", ");
  const jpgSrcSet = sizes.map(s => `${name}-${s}.jpg ${s}w`).join(", ");

  return `
    <picture>
      <source type="image/webp" srcset="${webpSrcSet}" sizes="(max-width: 768px) 100vw, 800px">
      <source type="image/jpeg" srcset="${jpgSrcSet}" sizes="(max-width: 768px) 100vw, 800px">
      <img src="${name}-400.jpg" 
           alt="${alt}" 
           class="article-cover" 
           loading="lazy" 
           decoding="async" 
           width="800" 
           height="450">
    </picture>
  `;
}

// Retorna a classe de cor por categoria
function getCategoryClass(category) {
  switch ((category || "").toLowerCase()) {
    case "react": return "category-react";
    case "carreira": return "category-carreira";
    case "ia": return "category-ia";
    case "pwa": return "category-pwa";
    default: return "category-default";
  }
}

fetch("articles.json")
  .then(res => {
    if (!res.ok) throw new Error("Erro ao carregar JSON");
    return res.json();
  })
  .then(data => {
    const container = document.getElementById("article-content");

    if (!id || isNaN(id)) {
      container.innerHTML = `
        <h2>Artigo não encontrado</h2>
        <p>Volte ao <a href="blog.html">blog</a> para explorar outros artigos.</p>
      `;
      return;
    }

    const article = data.find(a => a.id === id);
    if (!article) {
      container.innerHTML = `
        <h2>Artigo não encontrado</h2>
        <p>Volte ao <a href="blog.html">blog</a> para explorar outros artigos.</p>
      `;
      return;
    }

    // Atualiza <title> e meta tags
    document.title = `${article.title} | Ismael Nunes - Blog`;
    const desc = article.description || article.excerpt;
    const url = `${location.origin}${location.pathname}?id=${id}`;
    const imageBase = article.image || "images/placeholder";

    // Open Graph + Twitter
    const metaTags = [
      { property: "og:title", content: article.title },
      { property: "og:description", content: desc },
      { property: "og:type", content: "article" },
      { property: "og:url", content: url },
      { property: "og:image", content: `${location.origin}/${imageBase}-800.jpg` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: article.title },
      { name: "twitter:description", content: desc },
      { name: "twitter:image", content: `${location.origin}/${imageBase}-800.jpg` }
    ];
    metaTags.forEach(tag => {
      const meta = document.createElement("meta");
      if (tag.property) meta.setAttribute("property", tag.property);
      if (tag.name) meta.setAttribute("name", tag.name);
      meta.setAttribute("content", tag.content);
      document.head.appendChild(meta);
    });

    // Tags clicáveis
    const tagsHTML = (article.tags || [])
      .map(tag => `<a href="blog.html?tag=${encodeURIComponent(tag.toLowerCase())}" class="tag">#${tag}</a>`)
      .join(" ");

    // Referências
    let referencesHTML = "";
    if (article.references && article.references.length > 0) {
      const refsList = article.references
        .map(ref => ref.startsWith("http")
          ? `<li><a href="${ref}" target="_blank" rel="noopener noreferrer">${ref}</a></li>`
          : `<li>${ref}</li>`
        ).join("");
      referencesHTML = `
        <section class="references">
          <h3>Referências</h3>
          <ul>${refsList}</ul>
        </section>
      `;
    }

    // Relacionados: até 3 artigos com tags em comum
    const related = data
      .filter(a => a.id !== article.id && a.status === "published")
      .map(a => ({
        ...a,
        similarity: (a.tags || []).filter(tag =>
          (article.tags || []).map(t => t.toLowerCase()).includes(tag.toLowerCase())
        ).length
      }))
      .filter(a => a.similarity > 0)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3);

    let relatedHTML = "";
    if (related.length > 0) {
      relatedHTML = `
        <section class="related-posts">
          <h3>Artigos Relacionados</h3>
          <div class="related-grid">
            ${related.map(r => `
              <div class="related-card">
                <div class="related-image">
                  <img src="${r.image ? r.image + '-400.jpg' : 'images/placeholder-400.jpg'}" 
                       alt="${r.title}" loading="lazy">
                </div>
                <div class="related-content">
                  <span class="related-category ${getCategoryClass(r.category)}">
                    ${r.category || ""}
                  </span>
                  <h4><a href="blog-post.html?id=${r.id}">${r.title}</a></h4>
                  <p>${r.excerpt}</p>
                </div>
              </div>
            `).join("")}
          </div>
        </section>
      `;
    }

    // Render final
    container.innerHTML = `
      <header class="article-header">
        <h1 class="article-title">${article.title}</h1>
        <p class="article-meta">${article.date} · ${article.readTime}</p>
      </header>

      ${buildResponsiveImage(imageBase, article.title)}

      <div class="article-content">
        ${marked.parse(article.content)}
      </div>

      <footer class="article-footer">
        <div class="tags">${tagsHTML}</div>
        ${referencesHTML}
        <a href="blog.html" class="btn btn-primary">← Voltar ao Blog</a>
      </footer>

      ${relatedHTML}
    `;

    // Scroll suave ao topo
    window.scrollTo({ top: 0, behavior: "smooth" });
  })
  .catch(err => {
    console.error("Erro ao carregar artigo:", err);
    document.getElementById("article-content").innerHTML = `
      <p role="alert">Erro ao carregar o artigo. Tente novamente mais tarde.</p>
      <a href="blog.html" class="btn btn-primary">← Voltar ao Blog</a>
    `;
  });
